import { IUpdateObject } from "../interfaces/IUpdateObject";

export class UpdateObjectManager {
  updateObjects: IUpdateObject[] = [];

  public RegistUpdateObject(object: IUpdateObject): void {
    this.updateObjects.push(object);
  }

  // TODO: id 필요?
  // public RemoveUpdateObject(object: IUpdateObject): void {
  // }

  public Update(delta: number): void {
    for (const object of this.updateObjects) {
      object.Update(delta);
    }
  }
}
