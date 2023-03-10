import { ICharacterState } from "../../core/interfaces/ICharacterState";
import { Character } from "../Character";
import { MyCharacter } from "../MyCharacter";

export abstract class CharacterStateBase implements ICharacterState {
  public character: Character;
  public timer: number;
  public animationLength: number;

  constructor(character: Character) {
    this.character = character;

    if (this.character instanceof MyCharacter) {
      this.character.velocitySimulator.damping =
        this.character.defaultVelocitySimulatorDamping;

      this.character.velocitySimulator.mass =
        this.character.defaultVelocitySimulatorMass;

      this.character.rotationSimulator.damping =
        this.character.defaultRotationSimulatorDamping;
      this.character.rotationSimulator.mass =
        this.character.defaultRotationSimulatorMass;

      this.character.arcadeVelocityIsAdditive = false;
      this.character.SetArcadeVelocityInfluence(1, 0, 1);
    }

    this.timer = 0;
  }

  Update(delta: number): void {
    this.timer += delta;
  }

  OnInputChange(): void {
    if (!(this.character instanceof MyCharacter)) return;
  }

  protected noDirection(): boolean {
    if (!(this.character instanceof MyCharacter)) return false;

    return (
      !this.character.actions.up.isPressed &&
      !this.character.actions.down.isPressed &&
      !this.character.actions.left.isPressed &&
      !this.character.actions.right.isPressed
    );
  }

  protected anyDirection(): boolean {
    if (!(this.character instanceof MyCharacter)) return false;

    return (
      this.character.actions.up.isPressed ||
      this.character.actions.down.isPressed ||
      this.character.actions.left.isPressed ||
      this.character.actions.right.isPressed
    );
  }

  protected animationEnded(timeStep: number): boolean {
    if (this.character.mixer !== undefined) {
      if (this.animationLength === undefined) {
        console.error(
          this.constructor.name +
            "Error: Set this.animationLength in state constructor!"
        );
        return false;
      } else {
        return this.timer > this.animationLength - timeStep;
      }
    } else {
      return true;
    }
  }

  protected setAppropriateDropState(): void {}

  protected setAppropriateStartWalkState(): void {}

  protected playAnimation(animName: string, fadeIn: number): void {
    this.animationLength = this.character.SetAnimation(animName, fadeIn);
  }
}
