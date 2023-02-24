import {
  TextureLoader,
  ShaderMaterial,
  BufferGeometry,
  Points,
  Color,
  AdditiveBlending,
  Float32BufferAttribute,
  Vector3,
} from "three";

const vertexShader = `
attribute float size;
attribute float angle;
attribute vec4 colour;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * (300.0 / length(mvPosition.xyz));

  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}`;

const fragmentShader = `
uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;

class LinearSpline {
  points: any[] = [];
  lerp: Function;

  constructor(lerp: Function) {
    this.points = [];
    this.lerp = lerp;
  }

  public AddPoint(t: number, d: number | Color) {
    this.points.push([t, d]);
  }

  public Get(t: number) {
    let p1 = 0;

    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i][0] >= t) {
        break;
      }
      p1 = i;
    }

    const p2 = Math.min(this.points.length - 1, p1 + 1);

    if (p1 === p2) {
      return this.points[p1][1];
    }

    return this.lerp(
      (t - this.points[p1][0]) / (this.points[p2][0] - this.points[p1][0]),
      this.points[p1][1],
      this.points[p2][1]
    );
  }
}

export class TorchlightParticle {
  params: any;
  material: ShaderMaterial;
  particles: any[] = [];
  geometry: BufferGeometry;
  points: Points;
  enable: boolean = false;

  alphaSpline: LinearSpline;
  colourSpline: LinearSpline;
  sizeSpline: LinearSpline;

  constructor(params: any) {
    this.params = params;

    const uniforms = {
      diffuseTexture: {
        value: new TextureLoader().load("/img/fire.png"),
      },
    };

    this.material = new ShaderMaterial({
      uniforms: uniforms,
      vertexShader,
      fragmentShader,
      blending: AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute("position", new Float32BufferAttribute([], 3));
    this.geometry.setAttribute("size", new Float32BufferAttribute([], 1));
    this.geometry.setAttribute("colour", new Float32BufferAttribute([], 4));
    this.geometry.setAttribute("angle", new Float32BufferAttribute([], 1));

    this.points = new Points(this.geometry, this.material);

    this.params.scene.add(this.points);

    this.alphaSpline = new LinearSpline((t: any, a: any, b: any) => {
      return a + t * (b - a);
    });
    this.alphaSpline.AddPoint(0.0, 0.0);
    this.alphaSpline.AddPoint(0.1, 1.0);
    this.alphaSpline.AddPoint(0.6, 1.0);
    this.alphaSpline.AddPoint(1.0, 0.0);

    this.colourSpline = new LinearSpline((t: any, a: any, b: any) => {
      const c = a.clone();
      return c.lerp(b, t);
    });
    this.colourSpline.AddPoint(0.0, new Color(0xffff80));
    this.colourSpline.AddPoint(1.0, new Color(0xff8080));

    this.sizeSpline = new LinearSpline((t: any, a: any, b: any) => {
      return a + t * (b - a);
    });
    this.sizeSpline.AddPoint(0.0, 1.0);
    this.sizeSpline.AddPoint(0.5, 5.0);
    this.sizeSpline.AddPoint(1.0, 1.0);

    this.updateGeometry();
  }

  private addParticles() {
    const life = this.enable ? Math.random() * 0.8 : 0;
    this.particles.push({
      position: new Vector3(
        this.params.position.x + Math.random() * 0.05,
        this.params.position.y + Math.random() * 0.05,
        this.params.position.z + Math.random() * 0.05
      ),
      size: (Math.random() * 0.5 + 0.5) * 1.0,
      colour: new Color(),
      alpha: 1.0,
      life: life,
      maxLife: life,
      rotation: Math.random() * 2.0 * Math.PI,
      velocity: new Vector3().copy(this.params.velocity),
    });
  }

  private updateParticles(delta: number) {
    for (let p of this.particles) {
      p.life -= delta;
    }

    this.particles = this.particles.filter((p) => {
      return p.life > 0.0;
    });

    for (let p of this.particles) {
      const t = 1.0 - p.life / p.maxLife;

      p.rotation += delta * 0.5;
      p.alpha = this.alphaSpline.Get(t);
      p.currentSize = p.size * this.sizeSpline.Get(t);
      p.colour.copy(this.colourSpline.Get(t));
      p.position.add(p.velocity.clone().multiplyScalar(delta));
    }
  }

  private updateGeometry() {
    const positions = [];
    const sizes = [];
    const colours = [];
    const angles = [];

    for (const p of this.particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
      sizes.push(p.currentSize);
      angles.push(p.rotation);
    }

    this.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1));
    this.geometry.setAttribute(
      "colour",
      new Float32BufferAttribute(colours, 4)
    );
    this.geometry.setAttribute("angle", new Float32BufferAttribute(angles, 1));

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.colour.needsUpdate = true;
    this.geometry.attributes.angle.needsUpdate = true;
  }

  public Update(delta: number) {
    this.addParticles();
    this.updateParticles(delta);
    this.updateGeometry();
  }

  public Dispose() {
    this.params.scene.remove(this.points);
    this.particles = [];
    this.geometry.dispose();
    this.material.dispose();
  }

  public SetEnable(enable: boolean) {
    this.enable = enable;
  }
}
