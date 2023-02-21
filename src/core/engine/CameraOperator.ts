import { Camera, MathUtils, Vector2, Vector3 } from "three";
import { IInputReceiver } from "../interfaces/IInputReceiver";
import { IUpdateObject } from "../interfaces/IUpdateObject";
import { Managers } from "../managers/Managers";
import { KeyBinding } from "./KeyBinding";
import * as Utils from "./Utils";

export class CameraOperator implements IInputReceiver, IUpdateObject {
  public camera: Camera;
  public target: Vector3;
  public sensitivity: Vector2;
  public radius: number = 1;
  public theta: number;
  public phi: number;
  public targetRadius: number = 1;

  public movementSpeed: number;
  actions: { [action: string]: KeyBinding };

  public upVelocity: number = 0;
  public forwardVelocity: number = 0;
  public rightVelocity: number = 0;

  public followMode: boolean = false;

  constructor(
    camera: Camera,
    sensitivityX: number = 1,
    sensitivityY: number = sensitivityX * 0.8
  ) {
    this.camera = camera;
    this.target = new Vector3();
    this.sensitivity = new Vector2(sensitivityX, sensitivityY);

    this.movementSpeed = 0.1;
    this.radius = 3;
    this.theta = -90;
    this.phi = 0;

    this.actions = {
      forward: new KeyBinding("KeyW"),
      back: new KeyBinding("KeyS"),
      left: new KeyBinding("KeyA"),
      right: new KeyBinding("KeyD"),
      up: new KeyBinding("KeyE"),
      down: new KeyBinding("KeyQ"),
      fast: new KeyBinding("ShiftLeft"),
    };

    Managers.UpdateObject.RegistUpdateObject(this);
  }

  public SetSensitivity(
    sensitivityX: number,
    sensitivityY: number = sensitivityX
  ): void {
    this.sensitivity = new Vector2(sensitivityX, sensitivityY);
  }

  public SetRadius(value: number, instantly: boolean = false): void {
    this.targetRadius = Math.max(0.001, value);
    if (instantly === true) {
      this.radius = value;
    }
  }

  public Move(deltaX: number, deltaY: number): void {
    this.theta -= deltaX * (this.sensitivity.x / 2);
    this.theta %= 360;
    this.phi += deltaY * (this.sensitivity.y / 2);
    this.phi = Math.min(85, Math.max(-85, this.phi));
  }

  public Update(delta: number): void {
    this.radius = MathUtils.lerp(this.radius, this.targetRadius, 0.1);

    this.camera.position.x =
      this.target.x +
      this.radius *
        Math.sin((this.theta * Math.PI) / 180) *
        Math.cos((this.phi * Math.PI) / 180);
    this.camera.position.y =
      this.target.y + this.radius * Math.sin((this.phi * Math.PI) / 180);
    this.camera.position.z =
      this.target.z +
      this.radius *
        Math.cos((this.theta * Math.PI) / 180) *
        Math.cos((this.phi * Math.PI) / 180);
    this.camera.updateMatrix();
    this.camera.lookAt(this.target);
  }

  handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    if (code === "KeyC" && pressed === true && event.shiftKey === true) {
      Managers.Input.SetInputReceiver(Managers.Players.GetMyPlayer());
    } else {
      for (const action in this.actions) {
        if (this.actions.hasOwnProperty(action)) {
          const binding = this.actions[action];

          if (binding.eventCodes.includes(code)) {
            binding.isPressed = pressed;
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
          binding.isPressed = pressed;
        }
      }
    }
  }

  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
    this.Move(deltaX, deltaY);
  }

  handleMouseWheel(event: WheelEvent, value: number): void {}

  inputReceiverInit(): void {
    this.target.copy(this.camera.position);
    this.SetRadius(0, true);
  }

  inputReceiverUpdate(delta: number): void {
    let speed =
      this.movementSpeed *
      (this.actions.fast.isPressed ? delta * 600 : delta * 60);

    const up = Utils.getUp(this.camera);
    const right = Utils.getRight(this.camera);
    const forward = Utils.getBack(this.camera);

    this.upVelocity = MathUtils.lerp(
      this.upVelocity,
      +this.actions.up.isPressed - +this.actions.down.isPressed,
      0.3
    );
    this.forwardVelocity = MathUtils.lerp(
      this.forwardVelocity,
      +this.actions.forward.isPressed - +this.actions.back.isPressed,
      0.3
    );
    this.rightVelocity = MathUtils.lerp(
      this.rightVelocity,
      +this.actions.right.isPressed - +this.actions.left.isPressed,
      0.3
    );

    this.target.add(up.multiplyScalar(speed * this.upVelocity));
    this.target.add(forward.multiplyScalar(speed * this.forwardVelocity));
    this.target.add(right.multiplyScalar(speed * this.rightVelocity));
  }
}
