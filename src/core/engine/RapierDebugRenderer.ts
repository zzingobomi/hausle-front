import { World } from "@dimforge/rapier3d-compat/pipeline";
import { BufferAttribute, LineBasicMaterial, LineSegments, Scene } from "three";
import { IUpdateObject } from "../interfaces/IUpdateObject";
import { Managers } from "../managers/Managers";

export class RapierDebugRenderer implements IUpdateObject {
  private scene: Scene;
  private world: World;
  private mesh: LineSegments;

  constructor(scene: Scene, world: World) {
    this.scene = scene;
    this.world = world;

    const material = new LineBasicMaterial({
      color: 0xffffff,
    });
    material.vertexColors = true;

    const mesh = new LineSegments();
    mesh.frustumCulled = false;
    mesh.material = material;
    this.mesh = mesh;

    this.scene.add(mesh);

    Managers.UpdateObject.RegistUpdateObject(this);
  }

  Update(delta: number): void {
    const buffers = this.world.debugRender();

    this.mesh.geometry.setAttribute(
      "position",
      new BufferAttribute(buffers.vertices, 3)
    );
    this.mesh.geometry.setAttribute(
      "color",
      new BufferAttribute(buffers.colors, 4)
    );
  }
}
