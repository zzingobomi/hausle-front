import { Character } from "../Character";
import { MyCharacter } from "../MyCharacter";
import { CharacterStateBase } from "./CharacterStateBase";
import { Idle } from "./Idle";
import { Run } from "./Run";

export class Walk extends CharacterStateBase {
  constructor(character: Character) {
    super(character);

    if (this.character instanceof MyCharacter) {
      this.character.SetArcadeVelocityTarget(0.8);
    }

    this.playAnimation("Walk", 0.1);
  }

  public Update(timeStep: number): void {
    super.Update(timeStep);

    if (this.character instanceof MyCharacter) {
      this.character.SetCameraRelativeOrientationTarget();
    }
  }

  public OnInputChange(): void {
    if (!(this.character instanceof MyCharacter)) return;

    super.OnInputChange();

    // TEMP
    if (!this.character.actions) return;

    if (this.noDirection()) {
      this.character.SetState(new Idle(this.character));
    }

    if (this.character.actions.run.justPressed) {
      this.character.SetState(new Run(this.character));
    }
  }
}
