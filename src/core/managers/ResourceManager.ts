import { LoadingManager } from "three";
import { GLTF, GLTFLoader } from "three-stdlib";

export class ResourceManager {
  manager: LoadingManager;
  gltfLoader: GLTFLoader;

  constructor() {
    this.manager = new LoadingManager();
    this.gltfLoader = new GLTFLoader(this.manager);
  }

  public async Load(url: string): Promise<GLTF> {
    const gltf = await this.gltfLoader.loadAsync(url);
    return gltf;
  }
}
