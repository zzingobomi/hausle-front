import { AnimationAction, AnimationClip, AnimationMixer, Group } from "three";
import { RigidBody, Collider } from "@dimforge/rapier3d-compat";
import { ICharacterState } from "../core/interfaces/ICharacterState";

export interface ICharacter {
  height: number;
  tiltContainer: Group;
  modelContainer: Group;
  mixer: AnimationMixer;
  animations: AnimationClip[];

  rigidBody: RigidBody;
  collider: Collider;

  charState: ICharacterState;
  oldAction: AnimationAction;

  Update(delta: number): void;
}
