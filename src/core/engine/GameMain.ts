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
    const ambientLight = new AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    //const directionalLight = new DirectionalLight(0xffffff, 1);
    const directionalLight = new DirectionalLight(0xffffff, 3.5);
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
    this.rapierDebugRenderer = new RapierDebugRenderer(
      this.scene,
      this.physicsWorld
    );

    const dungeonGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/Dungeon.glb`
    );
    const leftStairsGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/left-stairs.glb`
    );
    const rightStairsGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/right-stairs.glb`
    );

    this.createTrimeshPhysics(leftStairsGltf.scene, 0.01, true, true);
    this.createTrimeshPhysics(rightStairsGltf.scene, 0.01, true);

    const navMesh = dungeonGltf.scene.getObjectByName("Navmesh");
    navMesh!.visible = false;

    dungeonGltf.scene.traverse((child) => {
      if (child.name.includes("Floor")) {
        this.createTrimeshPhysics(child);
      }
    });

    // 임시 바닥
    // const colliderDesc = ColliderDesc.cuboid(50, 1, 50);
    // colliderDesc.setTranslation(0, -1, 0);
    // this.physicsWorld.createCollider(colliderDesc);

    // TODO: 횃불 만들기

    this.dungeonWorld = dungeonGltf.scene;
    this.scene.add(this.dungeonWorld);

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
}
