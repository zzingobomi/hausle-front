import {
  AmbientLight,
  DirectionalLight,
  Group,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Object3D,
  Mesh,
  BufferGeometry,
  Vector3,
  Quaternion,
  Euler,
  PointLight,
} from "three";
import {
  init,
  World,
  EventQueue,
  ColliderDesc,
} from "@dimforge/rapier3d-compat";
import { Managers } from "../managers/Managers";
import { RapierDebugRenderer } from "./RapierDebugRenderer";
import { CameraOperator } from "./CameraOperator";
import { TorchlightParticle } from "../../contents/TorchlightParticle";
import Stats from "stats.js";

export enum GameMode {
  GAME,
  CHATTING,
}

export class GameMain {
  private divContainer: HTMLDivElement;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public cameraOperator: CameraOperator;

  public scene: Scene;
  private previousTime = 0;

  private dungeonWorld: Group;
  public physicsWorld: World;
  public eventQueue: EventQueue;
  private rapierDebugRenderer: RapierDebugRenderer;

  private torchParticles: TorchlightParticle[] = [];
  private torchLights: PointLight[] = [];

  // Debug
  public stats: Stats;

  constructor() {
    this.divContainer = document.querySelector("#container") as HTMLDivElement;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLight();
    this.registSubscribes();
    this.initWorld();

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));

    Managers.Main = this;
  }

  private initRenderer(): void {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    this.divContainer.appendChild(renderer.domElement);
    this.renderer = renderer;
  }

  private initScene(): void {
    const scene = new Scene();
    this.scene = scene;
  }

  private initCamera(): void {
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, 10, 0);
    this.cameraOperator = new CameraOperator(this.camera, 0.3);
  }

  private initLight(): void {
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }

  private registSubscribes(): void {}

  private async initWorld(): Promise<void> {
    // Rapier
    await init();
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.physicsWorld = new World(gravity);
    this.eventQueue = new EventQueue(false);
    // this.rapierDebugRenderer = new RapierDebugRenderer(
    //   this.scene,
    //   this.physicsWorld
    // );

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
      // if (child.name.includes("SD_Prop_CandleStand_02")) {
      //   this.createCuboidPhysics(child, {
      //     hx: 2,
      //     hy: 1,
      //     hz: 1,
      //     ry: 45,
      //   });
      // }
    });

    // 계단 collider
    this.createTrimeshPhysics(leftStairsGltf.scene, 0.01, true, true);
    this.createTrimeshPhysics(rightStairsGltf.scene, 0.01, true);

    // 임시 바닥
    // const colliderDesc = ColliderDesc.cuboid(50, 1, 50);
    // colliderDesc.setTranslation(0, -1, 0);
    // this.physicsWorld.createCollider(colliderDesc);

    this.dungeonWorld = dungeonGltf.scene;
    this.scene.add(this.dungeonWorld);

    this.createTorchlight(this.dungeonWorld);

    this.initServer();
  }

  private async initServer(): Promise<void> {
    Managers.Network.InitServer("test");
  }

  private update(delta: number): void {
    Managers.Instance.Update(delta);

    if (this.physicsWorld) {
      this.physicsWorld.timestep = delta;
      this.physicsWorld.step(this.eventQueue);
    }

    for (const particle of this.torchParticles) {
      particle.Update(delta);
    }
  }

  private resize() {
    const width = this.divContainer.clientWidth;
    const height = this.divContainer.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private render(time: number): void {
    this.stats.begin();

    time *= 0.001; // second unit

    const deltaTime = time - this.previousTime;

    // Logic
    this.update(deltaTime);

    // Rendering
    this.renderer.render(this.scene, this.camera);
    this.previousTime = time;

    this.stats.end();

    requestAnimationFrame(this.render.bind(this));
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
    colliderDesc
      .setTranslation(
        worldPosition.x,
        worldPosition.y + (config.calibrationY ?? 0),
        worldPosition.z
      )
      .setRotation({
        x: rotQuat.x,
        y: rotQuat.y,
        z: rotQuat.z,
        w: rotQuat.w,
      });

    this.physicsWorld.createCollider(colliderDesc);
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

          this.physicsWorld.createCollider(triColliderDesc);
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
        scene: this.scene,
        position: adjustPosition,
        velocity: new Vector3(0, 2, 0),
      });
      torchParticle.SetEnable(true);
      this.torchParticles.push(torchParticle);

      // Light
      const light = new PointLight(0xffffff, 5, 20);
      light.position.set(adjustPosition.x, adjustPosition.y, adjustPosition.z);
      this.scene.add(light);
    }
  }
}
