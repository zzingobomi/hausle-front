import { ICharacterState } from "../../core/interfaces/ICharacterState";
import { Character } from "../Character";
import { MyCharacter } from "../MyCharacter";
import { CharacterStateBase } from "./CharacterStateBase";
import { Walk } from "./Walk";

export class Idle extends CharacterStateBase implements ICharacterState {
  constructor(character: Character) {
    super(character);

    if (this.character instanceof MyCharacter) {
      this.character.velocitySimulator.damping = 0.6;
      this.character.velocitySimulator.mass = 10;

      this.character.SetArcadeVelocityTarget(0);
    }

    this.playAnimation("Idle", 0.1);
  }

  public Update(delta: number): void {
    super.Update(delta);

    if (this.character instanceof MyCharacter) {
      // TODO: StartWalkBase 가 있다면 거기로 옮기기
      this.character.SetCameraRelativeOrientationTarget();
    }
  }

  public OnInputChange(): void {
    if (!(this.character instanceof MyCharacter)) return;

    super.OnInputChange();

    if (this.character.actions.jump.justPressed) {
      //this.character.SetState(new JumpIdle(this.character));
    }

    if (this.anyDirection()) {
      this.character.SetArcadeVelocityTarget(0.8);
      // TODO: StartWalkBase 가 있다면 다시 풀기
      //if (this.character.velocity.length() > 0.05) {
      this.character.SetState(new Walk(this.character));
      //}
    } else {
      this.character.SetArcadeVelocityTarget(0);
    }
  }
}
