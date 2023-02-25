import { ColliderDesc } from "@dimforge/rapier3d-compat";
import {
  BufferGeometry,
  Euler,
  Mesh,
  Object3D,
  PointLight,
  Quaternion,
  Vector3,
} from "three";
import { Managers } from "../core/managers/Managers";
import { TorchlightParticle } from "./TorchlightParticle";

export class DungeonWorld {
  private torchParticles: TorchlightParticle[] = [];

  public async Init() {
    const dungeonGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/Dungeon.glb`
    );
    const leftStairsGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/left-stairs.glb`
    );
    const rightStairsGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/right-stairs.glb`
    );

    const navMesh = dungeonGltf.scene.getObjectByName("Navmesh");
    navMesh!.visible = false;

    const wall = dungeonGltf.scene.getObjectByName("Wall");
    wall?.traverse((child) => {
      child.visible = false;
      this.createTrimeshPhysics(child, 1);
    });

    dungeonGltf.scene.traverse((child) => {
      if (child.name.includes("Floor")) {
        this.createTrimeshPhysics(child);
      }
      if (child.name.includes("SD_Env_StoneCircle_01")) {
        this.createTrimeshPhysics(child);
      }
      if (child.name.includes("SD_Prop_Chest_Skull_01")) {
        this.createCuboidPhysics(child, {
          hx: 1.2,
          hy: 1.2,
          hz: 1,
          calibrationY: 1.2,
        });
      }
      if (child.name.includes("SD_Prop_Corpse_04")) {
        this.createCuboidPhysics(child, {
          hx: 0.8,
          hy: 1.5,
          hz: 0.5,
          calibrationY: 1.5,
        });
      }
      if (child.name.includes("SD_Prop_CandleStand_01")) {
        this.createCuboidPhysics(child, {
          hx: 0.8,
          hy: 1.5,
          hz: 0.8,
          calibrationY: 1.5,
        });
      }
      if (child.name.includes("SD_Prop_CandleStand_02")) {
        this.createTrimeshPhysics(child, 0.01, true);
      }
      if (child.name.includes("Panks")) {
        this.createTrimeshPhysics(child, 0.01, true);
      }
    });

    // 계단 collider
    this.createTrimeshPhysics(leftStairsGltf.scene, 0.01, true, true);
    this.createTrimeshPhysics(rightStairsGltf.scene, 0.01, true);

    // 임시 바닥
    // const colliderDesc = ColliderDesc.cuboid(50, 1, 50);
    // colliderDesc.setTranslation(0, -1, 0);
    // Managers.Main.physicsWorld.createCollider(colliderDesc);

    Managers.Main.scene.add(dungeonGltf.scene);

    this.createTorchlight(dungeonGltf.scene);
  }

  public Update(delta: number) {
    for (const particle of this.torchParticles) {
      particle.Update(delta);
    }
  }

  private createCuboidPhysics(
    object3D: Object3D,
    config: {
      hx: number;
      hy: number;
      hz: number;
      calibrationY?: number;
      rx?: number;
      ry?: number;
      rz?: number;
      worldQuat?: boolean;
    }
  ): void {
    const worldPosition = new Vector3();
    const worldQuaternion = new Quaternion();
    //const worldScale = new Vector3();

    object3D.getWorldPosition(worldPosition);
    object3D.getWorldQuaternion(worldQuaternion);
    //object3D.getWorldScale(worldScale);

    const rotationX = config.rx ?? 0;
    const rotationY = config.ry ?? 0;
    const rotationZ = config.rz ?? 0;
    const rotEuler = new Euler(rotationX, rotationY, rotationZ, "XYZ");
    const rotQuat = new Quaternion().setFromEuler(rotEuler);

    const colliderDesc = ColliderDesc.cuboid(config.hx, config.hy, config.hz);
    colliderDesc.setTranslation(
      worldPosition.x,
      worldPosition.y + (config.calibrationY ?? 0),
      worldPosition.z
    );

    Managers.Main.physicsWorld.createCollider(colliderDesc);
  }

  private createTrimeshPhysics(
    object3D: Object3D,
    scale = 0.01,
    isLocal = true,
    inverseX = false
  ): void {
    object3D.traverse((child) => {
      if (child instanceof Mesh) {
        const geometry = child.geometry;
        if (geometry instanceof BufferGeometry) {
          let triVertices = geometry.attributes.position.array as Float32Array;
          if (inverseX) {
            triVertices = triVertices.map((x: number, index: number) => {
              if (index % 3 === 0) {
                return x * -1.0;
              }
              return x;
            });
          }
          const triIndices = geometry.index?.array as Uint32Array;
          const triColliderDesc = ColliderDesc.trimesh(
            triVertices.map((x) => x * scale),
            triIndices
          );

          if (isLocal) {
            const worldPosition = new Vector3();
            const worldQuaternion = new Quaternion();
            //const worldScale = new Vector3();

            child.getWorldPosition(worldPosition);
            child.getWorldQuaternion(worldQuaternion);
            //child.getWorldScale(worldScale);

            triColliderDesc
              .setTranslation(worldPosition.x, worldPosition.y, worldPosition.z)
              .setRotation({
                x: worldQuaternion.x,
                y: worldQuaternion.y,
                z: worldQuaternion.z,
                w: worldQuaternion.w,
              });
          }

          Managers.Main.physicsWorld.createCollider(triColliderDesc);
        }
      }
    });
  }

  private createTorchlight(dungeonGltf: Object3D): void {
    const torchInfo = [
      {
        name: "SD_Prop_Torch_09",
        adjust: new Vector3(1, 1, 0),
      },
      {
        name: "SD_Prop_Torch_10",
        adjust: new Vector3(-1, 1, 0),
      },
      {
        name: "SD_Prop_Torch_11",
        adjust: new Vector3(0, 1, 1),
      },
      {
        name: "SD_Prop_Torch_12",
        adjust: new Vector3(0, 1, 1),
      },
      {
        name: "SD_Prop_Torch_13",
        adjust: new Vector3(0, 1, -1),
      },
      {
        name: "SD_Prop_Torch_14",
        adjust: new Vector3(0, 1, -1),
      },
    ];

    for (const info of torchInfo) {
      // Particle
      const torchObj = dungeonGltf.getObjectByName(info.name);
      const torchWorldPos = new Vector3();
      torchObj?.getWorldPosition(torchWorldPos);
      const adjustPosition = new Vector3().copy(torchWorldPos).add(info.adjust);
      const torchParticle = new TorchlightParticle({
        scene: Managers.Main.scene,
        position: adjustPosition,
        velocity: new Vector3(0, 2, 0),
      });
      torchParticle.SetEnable(true);
      this.torchParticles.push(torchParticle);

      // Light
      const light = new PointLight(0xffffff, 5, 20);
      light.position.set(adjustPosition.x, adjustPosition.y, adjustPosition.z);
      Managers.Main.scene.add(light);
    }
  }
}
