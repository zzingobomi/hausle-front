import * as Colyseus from "colyseus.js";
import { DataChange } from "@colyseus/schema";
import { Quaternion, Vector3 } from "three";
import { Managers } from "./Managers";
import { DungeonRoomState } from "../../shared/DungeonRoomState";
import { Player } from "../../shared/Player";
import { EventPacket } from "../../shared/EventPacket";
import PubSub from "pubsub-js";

export class NetworkManager {
  client: Colyseus.Client;
  room: Colyseus.Room<DungeonRoomState>;

  public async InitServer(nickname: string): Promise<void> {
    this.client = new Colyseus.Client(
      `ws://${process.env.REACT_APP_GAMESERVER}`
    );

    try {
      const room = await this.client.joinOrCreate("Dungeon", { nickname });
      this.room = room as Colyseus.Room<DungeonRoomState>;

      // Players
      this.room.state.players.onAdd = this.playerAdd.bind(this);
      this.room.state.players.onRemove = this.playerRemove.bind(this);
    } catch (e) {
      console.error("join error", e);
    }
  }

  public SendPosition(position: Vector3) {
    this.room.send(EventPacket.UpdatePlayerPosition, {
      x: position.x,
      y: position.y,
      z: position.z,
    });
  }

  public SendQuaternion(quaternion: Quaternion) {
    this.room.send(EventPacket.UpdatePlayerQuaternion, {
      x: quaternion.x,
      y: quaternion.y,
      z: quaternion.z,
      w: quaternion.w,
    });
  }

  public SendScale(scale: Vector3) {
    this.room.send(EventPacket.UpdatePlayerScale, {
      x: scale.x,
      y: scale.y,
      z: scale.z,
    });
  }

  public SendState(state: string) {
    this.room.send(EventPacket.UpdatePlayerState, state);
  }

  public SendEventPacket(packet: EventPacket, data: object | null = null) {
    this.room.send(packet, data);
  }

  ///
  /// Player
  ///
  private playerAdd(playerUpdator: Player, sessionId: string) {
    if (this.room.sessionId === sessionId) {
      Managers.Players.CreateMyPlayer(playerUpdator, sessionId);
    } else {
      Managers.Players.CreateRemotePlayer(playerUpdator, sessionId);
    }
  }

  private playerRemove(playerUpdator: Player, sessionId: string) {
    Managers.Players.RemovePlayer(sessionId);
  }
}
