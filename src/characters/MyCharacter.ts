import { Quaternion, Vector3 } from "three";
import { GLTF } from "three-stdlib";
import { KeyBinding } from "../core/engine/KeyBinding";
import { RelativeSpringSimulator } from "../core/physics/spring_simulation/RelativeSpringSimulator";
import { VectorSpringSimulator } from "../core/physics/spring_simulation/VectorSpringSimulator";
import {
  RigidBodyDesc,
  RigidBodyType,
  ColliderDesc,
  Capsule,
} from "@dimforge/rapier3d-compat";
import { Managers } from "../core/managers/Managers";
import { IInputReceiver } from "../core/interfaces/IInputReceiver";
import { ICharacterState } from "../core/interfaces/ICharacterState";
import { Idle } from "./character_states/Idle";
import { Character, TransformInfo } from "./Character";
import { GameMode } from "../core/engine/GameMain";
import * as Utils from "../core/engine/Utils";

export class MyCharacter extends Character implements IInputReceiver {
  // Movement
  public acceleration: Vector3 = new Vector3();
  public velocity: Vector3 = new Vector3();
  public arcadeVelocityInfluence: Vector3 = new Vector3();
  public velocityTarget: Vector3 = new Vector3();
  public arcadeVelocityIsAdditive: boolean = false;

  public defaultVelocitySimulatorDamping: number = 0.8;
  public defaultVelocitySimulatorMass: number = 50;
  public velocitySimulator: VectorSpringSimulator;
  public moveSpeed: number = 4;
  public angularVelocity: number = 0;
  public orientation: Vector3 = new Vector3(1, 0, 0);
  public orientationTarget: Vector3 = new Vector3(1, 0, 0);
  public defaultRotationSimulatorDamping: number = 0.5;
  public defaultRotationSimulatorMass: number = 10;
  public rotationSimulator: RelativeSpringSimulator;
  public viewVector: Vector3 = new Vector3();
  public actions: { [action: string]: KeyBinding };

  public defaultJumpPower: number = 1.0;
  public jumping: boolean = false;

  public physicsEnabled: boolean = true;

  // 서버 동기화
  private elaspedTime = 0;
  private oldPosition: Vector3 = new Vector3();
  private oldQuaternion: Quaternion = new Quaternion();
  private oldScale: Vector3 = new Vector3(1, 1, 1);

  constructor(gltf: GLTF, transformInfo: TransformInfo, nickname: string = "") {
    super(gltf, transformInfo, nickname);

    this.velocitySimulator = new VectorSpringSimulator(
      60,
      this.defaultVelocitySimulatorMass,
      this.defaultVelocitySimulatorDamping
    );
    this.rotationSimulator = new RelativeSpringSimulator(
      60,
      this.defaultRotationSimulatorMass,
      this.defaultRotationSimulatorDamping
    );

    // Actions
    this.actions = {
      // Movement
      up: new KeyBinding("KeyW", "ArrowUp"),
      down: new KeyBinding("KeyS", "ArrowDown"),
      left: new KeyBinding("KeyA", "ArrowLeft"),
      right: new KeyBinding("KeyD", "ArrowRight"),
      run: new KeyBinding("ShiftLeft"),
      jump: new KeyBinding("Space"),
    };

    // Physics
    let rigidBodyDesc = new RigidBodyDesc(RigidBodyType.Dynamic).setTranslation(
      transformInfo.position.x,
      transformInfo.position.y + this.height / 2,
      transformInfo.position.z
    );
    let colliderDesc = new ColliderDesc(
      new Capsule(this.height / 2 - this.diameter / 2, this.diameter / 2)
    );
    this.rigidBody = Managers.Main.physicsWorld.createRigidBody(rigidBodyDesc);
    this.rigidBody.setEnabledRotations(false, false, false, true);
    this.collider = Managers.Main.physicsWorld.createCollider(
      colliderDesc,
      this.rigidBody
    );

    this.SetAnimations(gltf.animations);
    this.SetState(new Idle(this));

    this.oldPosition.copy(transformInfo.position);
    this.oldQuaternion.copy(transformInfo.quaternion);
    this.oldScale.copy(transformInfo.scale);

    Managers.Input.SetInputReceiver(this);
  }

  public SetPosition(x: number, y: number, z: number): void {
    if (this.physicsEnabled) {
      this.rigidBody.setTranslation({ x, y, z }, true);
    } else {
      this.position.x = x;
      this.position.y = y;
      this.position.z = z;
    }
  }

  public SetViewVector(vector: Vector3): void {
    this.viewVector.copy(vector).normalize();
  }

  public SetState(state: ICharacterState): void {
    super.SetState(state);
    this.charState.OnInputChange();

    Managers.Network.SendState(state.constructor.name);
  }

  public SetArcadeVelocityInfluence(
    x: number,
    y: number = x,
    z: number = x
  ): void {
    this.arcadeVelocityInfluence.set(x, y, z);
  }

  public SetArcadeVelocityTarget(
    velZ: number,
    velX: number = 0,
    velY: number = 0
  ): void {
    this.velocityTarget.z = velZ;
    this.velocityTarget.x = velX;
    this.velocityTarget.y = velY;
  }

  public SetOrientation(vector: Vector3, instantly: boolean = false): void {
    let lookVector = new Vector3().copy(vector).setY(0).normalize();
    this.orientationTarget.copy(lookVector);

    if (instantly) {
      this.orientation.copy(lookVector);
    }
  }

  public ResetOrientation(): void {
    const forward = Utils.getForward(this);
    this.SetOrientation(forward, true);
  }

  public GetLocalMovementDirection(): Vector3 {
    const positiveX = this.actions.right.isPressed ? -1 : 0;
    const negativeX = this.actions.left.isPressed ? 1 : 0;
    const positiveZ = this.actions.up.isPressed ? 1 : 0;
    const negativeZ = this.actions.down.isPressed ? -1 : 0;

    return new Vector3(
      positiveX + negativeX,
      0,
      positiveZ + negativeZ
    ).normalize();
  }

  public GetCameraRelativeMovementVector(): Vector3 {
    const localDirection = this.GetLocalMovementDirection();
    const flatViewVector = new Vector3(
      this.viewVector.x,
      0,
      this.viewVector.z
    ).normalize();

    return Utils.appplyVectorMatrixXZ(flatViewVector, localDirection);
  }

  public SetCameraRelativeOrientationTarget(): void {
    let moveVector = this.GetCameraRelativeMovementVector();

    if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
      this.SetOrientation(this.orientation);
    } else {
      this.SetOrientation(moveVector);
    }
  }

  public Jump(jumping: boolean): void {
    this.jumping = jumping;
  }

  protected triggerAction(actionName: string, value: boolean): void {
    let action = this.actions[actionName];

    if (action.isPressed !== value) {
      action.isPressed = value;

      action.justPressed = false;
      action.justReleased = false;

      if (value) action.justPressed = true;
      else action.justReleased = true;

      this.charState.OnInputChange();

      // Reset the 'just' attributes
      action.justPressed = false;
      action.justReleased = false;
    }
  }

  handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    if (code === "KeyC" && pressed === true && event.shiftKey === true) {
      Managers.Input.SetInputReceiver(Managers.Main.cameraOperator);
    } else {
      if (Managers.Main.gameMode !== GameMode.GAME) return;

      for (const action in this.actions) {
        if (this.actions.hasOwnProperty(action)) {
          const binding = this.actions[action];

          if (binding.eventCodes.includes(code)) {
            this.triggerAction(action, pressed);
          }
        }
      }
    }
  }

  handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
    for (const action in this.actions) {
      if (this.actions.hasOwnProperty(action)) {
        const binding = this.actions[action];

        if (binding.eventCodes.includes(code)) {
          this.triggerAction(action, pressed);
        }
      }
    }
  }

  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
    Managers.Main.cameraOperator.Move(deltaX, deltaY);
  }

  handleMouseWheel(event: WheelEvent, value: number): void {}

  inputReceiverInit(): void {
    Managers.Main.cameraOperator.SetRadius(1.6, true);
    Managers.Main.cameraOperator.followMode = false;
  }

  inputReceiverUpdate(delta: number): void {
    this.viewVector = new Vector3().subVectors(
      this.position,
      Managers.Main.camera.position
    );
    this.getWorldPosition(Managers.Main.cameraOperator.target);
  }

  Update(delta: number): void {
    this.charState?.Update(delta);

    if (this.physicsEnabled) this.springMovement(delta);
    if (this.physicsEnabled) this.springRotation(delta);
    if (this.physicsEnabled) this.rotateModel();
    if (this.mixer !== undefined) this.mixer.update(delta);

    if (this.physicsEnabled) {
      this.position.set(
        this.rigidBody.translation().x,
        this.rigidBody.translation().y,
        this.rigidBody.translation().z
      );

      let arcadeVelocity = new Vector3()
        .copy(this.velocity)
        .multiplyScalar(this.moveSpeed);
      arcadeVelocity = Utils.appplyVectorMatrixXZ(
        this.orientation,
        arcadeVelocity
      );

      this.rigidBody.setLinvel(
        {
          x: arcadeVelocity.x,
          y: this.jumping ? this.defaultJumpPower : this.rigidBody.linvel().y,
          z: arcadeVelocity.z,
        },
        true
      );
    }

    // TODO: 서버에서 rough 하게 이동 검사 한 후 만약 말도 안되면 다시 조정해주는 프로세스 필요..

    // 값의 변화가 있을 때 && 50ms 가 지났을 때
    this.elaspedTime += delta * 1000;
    if (this.elaspedTime >= 50) {
      if (Utils.checkDiffVec(this.oldPosition, this.position)) {
        Managers.Network.SendPosition(Utils.fixedVec3(this.position));
        this.oldPosition.copy(this.position);
      }
      if (Utils.checkDiffQuat(this.oldQuaternion, this.quaternion)) {
        Managers.Network.SendQuaternion(Utils.fixedQuat(this.quaternion));
        this.oldQuaternion.copy(this.quaternion);
      }
      this.elaspedTime = 0;
    }
  }

  private springMovement(delta: number): void {
    this.velocitySimulator.target.copy(this.velocityTarget);
    this.velocitySimulator.simulate(delta);

    this.velocity.copy(this.velocitySimulator.position);
    this.acceleration.copy(this.velocitySimulator.velocity);
  }

  private springRotation(timeStep: number): void {
    let angle = Utils.getSignedAngleBetweenVectors(
      this.orientation,
      this.orientationTarget
    );

    this.rotationSimulator.target = angle;
    this.rotationSimulator.simulate(timeStep);
    let rot = this.rotationSimulator.position;

    this.orientation.applyAxisAngle(new Vector3(0, 1, 0), rot);
    this.angularVelocity = this.rotationSimulator.velocity;
  }

  private rotateModel(): void {
    this.lookAt(
      this.position.x + this.orientation.x,
      this.position.y + this.orientation.y,
      this.position.z + this.orientation.z
    );
    this.tiltContainer.rotation.z =
      -this.angularVelocity * 2.3 * this.velocity.length();
    this.tiltContainer.position.setY(
      Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) /
        2 -
        0.5
    );
  }
}
