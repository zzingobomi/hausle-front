export interface ICharacterState {
  Update(delta: number): void;
  OnInputChange(): void;
}
