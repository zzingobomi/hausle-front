import { Character } from "../Character";
import { MyCharacter } from "../MyCharacter";
import { CharacterStateBase } from "./CharacterStateBase";
import { Idle } from "./Idle";
import { Walk } from "./Walk";

export class Run extends CharacterStateBase {
  constructor(character: Character) {
    super(character);

    if (this.character instanceof MyCharacter) {
      this.character.velocitySimulator.mass = 10;
      this.character.rotationSimulator.damping = 0.8;
      this.character.rotationSimulator.mass = 50;

      this.character.SetArcadeVelocityTarget(1.4);
    }

    this.playAnimation("Run", 0.1);
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

    if (!this.character.actions.run.isPressed) {
      this.character.SetState(new Walk(this.character));
    }

    if (this.noDirection()) {
      this.character.SetState(new Idle(this.character));
    }
  }
}
