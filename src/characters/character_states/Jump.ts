import { Character } from "../Character";
import { MyCharacter } from "../MyCharacter";
import { CharacterStateBase } from "./CharacterStateBase";
import { Idle } from "./Idle";

export class Jump extends CharacterStateBase {
  private alreadyJumped: boolean;

  constructor(character: Character) {
    super(character);

    this.playAnimation("Jump", 0.1);
    this.alreadyJumped = false;
  }

  public Update(timeStep: number): void {
    super.Update(timeStep);

    if (this.character instanceof MyCharacter) {
      this.character.SetCameraRelativeOrientationTarget();
      if (!this.alreadyJumped) {
        this.alreadyJumped = true;
      } else {
        if (this.timer >= 0.3) {
          this.character.Jump(true);
        }
        if (this.timer >= this.animationLength / 2) {
          this.character.Jump(false);
          this.character.SetArcadeVelocityTarget(0);
        }
        if (this.timer >= this.animationLength) {
          this.character.SetState(new Idle(this.character));
        }
      }
    }
  }

  public OnInputChange(): void {
    if (!(this.character instanceof MyCharacter)) return;

    super.OnInputChange();

    // TEMP
    if (!this.character.actions) return;
  }
}
