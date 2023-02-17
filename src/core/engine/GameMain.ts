import {
  AmbientLight,
  DirectionalLight,
  Group,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import { init, World } from "@dimforge/rapier3d-compat";
import Stats from "stats.js";
import { Managers } from "../managers/Managers";

export enum GameMode {
  GAME,
  CHATTING,
}

export class GameMain {
  private divContainer: HTMLDivElement;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;

  public scene: Scene;
  private previousTime = 0;

  private dungeonWorld: Group;
  public physicsWorld: World;

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
  }

  private initRenderer(): void {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.outputEncoding = sRGBEncoding;
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
  }

  private initLight(): void {
    const ambientLight = new AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }

  private registSubscribes(): void {}

  private async initWorld(): Promise<void> {
    // Rapier
    await init();
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.physicsWorld = new World(gravity);
    // this.rapierDebugRenderer = new RapierDebugRenderer(
    //   this.scene,
    //   this.physicsWorld
    // );

    const dungeonGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/Dungeon.glb`
    );
    const rosalesGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/Rosales.glb`
    );
    const castleGuardGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/CastleGuard.glb`
    );
    const paladinGltf = await Managers.Resource.Load(
      `http://${process.env.REACT_APP_STORAGE}/hausle/Paladin.glb`
    );
    this.dungeonWorld = dungeonGltf.scene;
    this.scene.add(this.dungeonWorld);

    this.initServer();
  }

  private async initServer(): Promise<void> {}

  private update(delta: number): void {
    this.physicsWorld?.step();
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
}
