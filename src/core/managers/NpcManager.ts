import { Quaternion, Vector3 } from "three";
import { Character, TransformInfo } from "../../characters/Character";
import { RemoteCharacter } from "../../characters/RemoteCharacter";
import { Npc } from "../../shared/Npc";
import { Player } from "../../shared/Player";
import { Managers } from "./Managers";

export interface NpcInfo {
  networkId: string;
  npcUpdator: Player;
  character: Character;
}

export class NpcManager {
  npcs: NpcInfo[] = [];

  public async CreateNpc(npcUpdator: Npc, networkId: string) {
    console.log("npc", networkId);
    const { position, quaternion, scale } =
      this.createTransformInfo(npcUpdator);
    const charGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/CastleGuard.glb`
    );
    charGltf.scene.scale.set(0.01, 0.01, 0.01);
    const npcCharacter = new RemoteCharacter(charGltf, {
      position,
      quaternion,
      scale,
    });
    const info: NpcInfo = {
      networkId,
      npcUpdator,
      character: npcCharacter,
    };
    this.npcs.push(info);

    npcCharacter.SetOnChange(npcUpdator);

    Managers.Main.scene.add(npcCharacter);
  }

  public RemoveNpc(networkId: string) {
    const removeIndex = this.npcs.findIndex(
      (npc) => npc.networkId === networkId
    );
    if (removeIndex !== -1) {
      this.npcs[removeIndex].character.Dispose();
      this.npcs.splice(removeIndex, 1);
    }
  }

  public Update(delta: number): void {
    for (const npc of this.npcs) {
      npc.character.Update(delta);
    }
  }

  private createTransformInfo(npcUpdator: Npc): TransformInfo {
    const startPosition = new Vector3(
      npcUpdator.transform.position.x,
      npcUpdator.transform.position.y,
      npcUpdator.transform.position.z
    );
    const startQuaternion = new Quaternion(
      npcUpdator.transform.quaternion.x,
      npcUpdator.transform.quaternion.y,
      npcUpdator.transform.quaternion.z,
      npcUpdator.transform.quaternion.w
    );
    const startScale = new Vector3(
      npcUpdator.transform.scale.x,
      npcUpdator.transform.scale.y,
      npcUpdator.transform.scale.z
    );

    return {
      position: startPosition,
      quaternion: startQuaternion,
      scale: startScale,
    };
  }
}
