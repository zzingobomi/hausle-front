import { GameMain } from "../engine/GameMain";
import { ResourceManager } from "./ResourceManager";

export class Managers {
  private static s_instance: Managers;
  static get Instance(): Managers {
    this.Init();
    return this.s_instance;
  }

  _main: GameMain;
  _resource: ResourceManager = new ResourceManager();

  static get Main(): GameMain {
    return Managers.Instance._main;
  }
  static set Main(value: GameMain) {
    Managers.Instance._main = value;
  }
  static get Resource(): ResourceManager {
    return Managers.Instance._resource;
  }

  public Update(delta: number): void {}

  static Init(): void {
    if (!this.s_instance) {
      this.s_instance = new Managers();

      // TODO: 다른 매니저들 초기화
    }
  }

  public static Clear(): void {}
}
