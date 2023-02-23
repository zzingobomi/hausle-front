import { Character, TransformInfo } from "../../characters/Character";
import { MyCharacter } from "../../characters/MyCharacter";
import { RemoteCharacter } from "../../characters/RemoteCharacter";
import { Player } from "../../shared/Player";
import { Managers } from "./Managers";
import * as Utils from "../engine/Utils";

export interface PlayerInfo {
  sessionId: string;
  isMine: boolean;
  playerUpdator: Player;
  character: Character;
}

export class PlayerManager {
  players: PlayerInfo[] = [];
  myPlayer: PlayerInfo;

  public async CreateMyPlayer(playerUpdator: Player, sessionId: string) {
    console.log("myPlayer", sessionId);
    const { position, quaternion, scale } =
      this.createTransformInfo(playerUpdator);
    const charGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/Arissa.glb`
    );
    const myCharacter = new MyCharacter(
      charGltf,
      {
        position,
        quaternion,
        scale,
      },
      playerUpdator.nickname
    );
    const info: PlayerInfo = {
      sessionId,
      isMine: true,
      playerUpdator,
      character: myCharacter,
    };
    this.players.push(info);
    this.myPlayer = info;

    Managers.Main.scene.add(myCharacter);
  }

  public async CreateRemotePlayer(playerUpdator: Player, sessionId: string) {
    console.log("remotePlayer", sessionId);
    const { position, quaternion, scale } =
      this.createTransformInfo(playerUpdator);
    const charGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/Arissa.glb`
    );
    const remoteCharacter = new RemoteCharacter(
      charGltf,
      {
        position,
        quaternion,
        scale,
      },
      playerUpdator.nickname
    );
    const info: PlayerInfo = {
      sessionId,
      isMine: true,
      playerUpdator,
      character: remoteCharacter,
    };
    this.players.push(info);

    remoteCharacter.SetOnChange(playerUpdator);

    Managers.Main.scene.add(remoteCharacter);
  }

  public GetMyPlayer(): MyCharacter {
    return this.myPlayer.character as MyCharacter;
  }

  public RemovePlayer(sessionId: string) {
    const removeIndex = this.players.findIndex(
      (player) => player.sessionId === sessionId
    );
    if (removeIndex !== -1) {
      this.players[removeIndex].character.Dispose();
      this.players.splice(removeIndex, 1);
    }
  }

  public Update(delta: number): void {
    for (const player of this.players) {
      player.character.Update(delta);
    }
  }

  private createTransformInfo(playerUpdator: Player): TransformInfo {
    const startPosition = Utils.vec32three(playerUpdator.transform.position);
    const startQuaternion = Utils.vec42three(
      playerUpdator.transform.quaternion
    );
    const startScale = Utils.vec32three(playerUpdator.transform.scale);

    return {
      position: startPosition,
      quaternion: startQuaternion,
      scale: startScale,
    };
  }
}
