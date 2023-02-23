import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Object3D,
  Quaternion,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
  Box3,
} from "three";
import { GLTF } from "three-stdlib";
import { RigidBody, Collider } from "@dimforge/rapier3d-compat";
import { Managers } from "../core/managers/Managers";
import { ICharacterState } from "../core/interfaces/ICharacterState";
import { ICharacter } from "./ICharacter";

export interface TransformInfo {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
}

export class Character extends Object3D implements ICharacter {
  height: number;
  diameter: number;
  tiltContainer: Group;
  modelContainer: Group;
  mixer: AnimationMixer;

  rigidBody: RigidBody;
  collider: Collider;

  charState: ICharacterState;
  oldAction: AnimationAction;

  nickname: string;

  constructor(gltf: GLTF, transformInfo: TransformInfo, nickname: string) {
    super();
    gltf.scene.scale.set(0.01, 0.01, 0.01);

    const box = new Box3().setFromObject(gltf.scene);
    this.height = box.max.y - box.min.y;
    this.diameter = box.max.z - box.min.z;

    this.tiltContainer = new Group();
    this.add(this.tiltContainer);

    this.modelContainer = new Group();
    this.tiltContainer.add(this.modelContainer);
    this.modelContainer.add(gltf.scene);

    this.mixer = new AnimationMixer(gltf.scene);

    this.nickname = nickname;
    this.createNicknameBillboard();
  }

  public SetAnimations(animations: AnimationClip[]): void {
    this.animations = animations;
  }

  public SetState(state: ICharacterState): void {
    this.charState = state;
  }

  public SetPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
  }

  public SetQuaternion(x: number, y: number, z: number, w: number): void {
    this.quaternion.set(x, y, z, w);
  }

  public SetAnimation(clipName: string, fadeIn: number): number {
    if (this.mixer !== undefined) {
      const clip = AnimationClip.findByName(this.animations, clipName);
      const action = this.mixer.clipAction(clip);
      if (action === null) {
        console.error(`Animation ${clipName} not found!`);
        return 0;
      }

      action.reset();
      action.play();
      if (this.oldAction) {
        action.crossFadeFrom(this.oldAction, fadeIn, true);
      }
      this.oldAction = action;

      return action.getClip().duration;
    }

    return 0;
  }

  Update(delta: number): void {}

  public Dispose(): void {
    Managers.Main.scene.remove(this);
    Managers.Main.physicsWorld.removeCollider(this.collider, true);
    Managers.Main.physicsWorld.removeRigidBody(this.rigidBody);
  }

  protected createNicknameBillboard(): void {
    if (!this.nickname || this.nickname === "") return;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = "20pt Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(this.nickname, 256, 88);
    ctx.strokeText(this.nickname, 256, 88);

    const tex = new Texture(canvas);
    tex.needsUpdate = true;
    const spriteMat = new SpriteMaterial({ map: tex });
    const sprite = new Sprite(spriteMat);
    sprite.position.set(0, 0.4, 0);
    sprite.scale.set(2, 2, 2);

    this.add(sprite);
  }
}
