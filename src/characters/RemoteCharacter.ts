import {
  ColliderDesc,
  RigidBodyDesc,
  RigidBodyType,
  Capsule,
} from "@dimforge/rapier3d-compat";
import { Quaternion, Vector3 } from "three";
import { GLTF } from "three-stdlib";
import { Managers } from "../core/managers/Managers";
import { Character, TransformInfo } from "./Character";
import { Idle } from "./character_states/Idle";
import { DataChange } from "@colyseus/schema";
import { Vec3 } from "../shared/Vec3";
import { Vec4 } from "../shared/Vec4";
import { Player } from "../shared/Player";
import { CharStateType } from "../shared/CharStateType";
import * as Utils from "../core/engine/Utils";

export class RemoteCharacter extends Character {
  public serverPosition = new Vector3();
  public serverQuaternion = new Quaternion();
  public serverScale = new Vector3();

  constructor(gltf: GLTF, transformInfo: TransformInfo, nickname: string = "") {
    super(gltf, transformInfo, nickname);

    // initial transform
    this.serverPosition.copy(transformInfo.position);
    this.serverQuaternion.copy(transformInfo.quaternion);
    this.serverScale.copy(transformInfo.scale);

    // Physics
    let rigidBodyDesc = new RigidBodyDesc(RigidBodyType.Fixed).setTranslation(
      transformInfo.position.x,
      transformInfo.position.y,
      transformInfo.position.z
    );
    let colliderDesc = new ColliderDesc(new Capsule(0.5, 0.25));
    this.rigidBody = Managers.Main.physicsWorld.createRigidBody(rigidBodyDesc);
    this.collider = Managers.Main.physicsWorld.createCollider(
      colliderDesc,
      this.rigidBody
    );

    this.SetAnimations(gltf.animations);
    this.SetState(new Idle(this));
  }

  public SetOnChange(playerUpdator: Player): void {
    playerUpdator.transform.position.onChange = (
      changes: DataChange<Vec3>[]
    ) => {
      this.serverPosition.copy(
        Utils.vec32three(playerUpdator.transform.position)
      );
    };
    playerUpdator.transform.quaternion.onChange = (
      changes: DataChange<Vec4>[]
    ) => {
      this.serverQuaternion.copy(
        Utils.vec42three(playerUpdator.transform.quaternion)
      );
    };
    playerUpdator.transform.scale.onChange = (changes: DataChange<Vec3>[]) => {
      this.serverScale.copy(Utils.vec32three(playerUpdator.transform.scale));
    };
    playerUpdator.state.onChange = (changes: DataChange<string>[]) => {
      this.SetState(
        Utils.characterStateFactory(
          playerUpdator.state.stateName as CharStateType,
          this
        )
      );
    };
  }

  Update(delta: number): void {
    this.charState?.Update(delta);
    this.mixer?.update(delta);

    this.SetPosition(
      this.rigidBody.translation().x,
      this.rigidBody.translation().y,
      this.rigidBody.translation().z
    );
    this.SetQuaternion(
      this.rigidBody.rotation().x,
      this.rigidBody.rotation().y,
      this.rigidBody.rotation().z,
      this.rigidBody.rotation().w
    );

    // 위치 동기화
    const interPosition = new Vector3(
      this.rigidBody.translation().x,
      this.rigidBody.translation().y,
      this.rigidBody.translation().z
    );
    interPosition.lerp(this.serverPosition, 0.2);
    this.rigidBody.setTranslation(
      {
        x: interPosition.x,
        y: interPosition.y,
        z: interPosition.z,
      },
      true
    );

    // 회전 동기화
    const interQuaternion = new Quaternion(
      this.rigidBody.rotation().x,
      this.rigidBody.rotation().y,
      this.rigidBody.rotation().z,
      this.rigidBody.rotation().w
    );
    interQuaternion.slerp(this.serverQuaternion, 0.2);
    this.rigidBody.setRotation(
      {
        x: interQuaternion.x,
        y: interQuaternion.y,
        z: interQuaternion.z,
        w: interQuaternion.w,
      },
      true
    );
  }
}
