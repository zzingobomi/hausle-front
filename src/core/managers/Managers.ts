import { GameMain } from "../engine/GameMain";
import { InputManager } from "./InputManager";
import { NetworkManager } from "./NetworkManager";
import { NpcManager } from "./NpcManager";
import { PlayerManager } from "./PlayerManager";
import { ResourceManager } from "./ResourceManager";
import { UpdateObjectManager } from "./UpdateObjectManager";

export class Managers {
  private static s_instance: Managers;
  static get Instance(): Managers {
    this.Init();
    return this.s_instance;
  }

  _main: GameMain;
  _input: InputManager = new InputManager();
  _resource: ResourceManager = new ResourceManager();
  _updateObject: UpdateObjectManager = new UpdateObjectManager();
  _network: NetworkManager = new NetworkManager();
  _players: PlayerManager = new PlayerManager();
  _npcs: NpcManager = new NpcManager();

  static get Main(): GameMain {
    return Managers.Instance._main;
  }
  static set Main(value: GameMain) {
    Managers.Instance._main = value;
  }
  static get Input(): InputManager {
    return Managers.Instance._input;
  }
  static get Resource(): ResourceManager {
    return Managers.Instance._resource;
  }
  static get UpdateObject(): UpdateObjectManager {
    return Managers.Instance._updateObject;
  }
  static get Network(): NetworkManager {
    return Managers.Instance._network;
  }
  static get Players(): PlayerManager {
    return Managers.Instance._players;
  }
  static get Npcs(): NpcManager {
    return Managers.Instance._npcs;
  }

  public Update(delta: number): void {
    this._input.Update(delta);
    this._updateObject.Update(delta);
    this._players.Update(delta);
    this._npcs.Update(delta);
  }

  static Init(): void {
    if (!this.s_instance) {
      this.s_instance = new Managers();

      // TODO: 다른 매니저들 초기화
    }
  }

  public static Clear(): void {
    this.Input.Dispose();
  }
}
