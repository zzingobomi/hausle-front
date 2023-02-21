import { Matrix4, Object3D, Quaternion, Vector3 } from "three";
import { Character } from "../../characters/Character";
import { Idle } from "../../characters/character_states/Idle";
import { Run } from "../../characters/character_states/Run";
import { Walk } from "../../characters/character_states/Walk";
import { Vec3 } from "../../shared/Vec3";
import { Vec4 } from "../../shared/Vec4";
import { CharStateType } from "../../shared/CharStateType";
import { Space } from "../enums/Space";
import { SimulationFrame } from "../physics/spring_simulation/SimulationFrame";

export function vec32three(vec: Vec3): Vector3 {
  return new Vector3(vec.x, vec.y, vec.z);
}

export function vec42three(quat: Vec4): Quaternion {
  return new Quaternion(quat.x, quat.y, quat.z, quat.w);
}

export function three2Vec3(vec: Vector3): Vec3 {
  return new Vec3(vec.x, vec.y, vec.z);
}

export function three2Vec4(quat: Quaternion): Vec4 {
  return new Vec4(quat.x, quat.y, quat.z, quat.w);
}

export function getRight(obj: Object3D, space: Space = Space.Global): Vector3 {
  const matrix = getMatrix(obj, space);
  return new Vector3(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[2]
  );
}

export function getUp(obj: Object3D, space: Space = Space.Global): Vector3 {
  const matrix = getMatrix(obj, space);
  return new Vector3(
    matrix.elements[4],
    matrix.elements[5],
    matrix.elements[6]
  );
}

export function getForward(
  obj: Object3D,
  space: Space = Space.Global
): Vector3 {
  const matrix = getMatrix(obj, space);
  return new Vector3(
    matrix.elements[8],
    matrix.elements[9],
    matrix.elements[10]
  );
}

export function getBack(obj: Object3D, space: Space = Space.Global): Vector3 {
  const matrix = getMatrix(obj, space);
  return new Vector3(
    -matrix.elements[8],
    -matrix.elements[9],
    -matrix.elements[10]
  );
}

export function getMatrix(obj: Object3D, space: Space): Matrix4 {
  switch (space) {
    case Space.Local:
      return obj.matrix;
    case Space.Global:
      return obj.matrixWorld;
  }
}

export function spring(
  source: number,
  dest: number,
  velocity: number,
  mass: number,
  damping: number
): SimulationFrame {
  let acceleration = dest - source;
  acceleration /= mass;
  velocity += acceleration;
  velocity *= damping;

  let position = source + velocity;

  return new SimulationFrame(position, velocity);
}

export function springV(
  source: Vector3,
  dest: Vector3,
  velocity: Vector3,
  mass: number,
  damping: number
): void {
  let acceleration = new Vector3().subVectors(dest, source);
  acceleration.divideScalar(mass);
  velocity.add(acceleration);
  velocity.multiplyScalar(damping);
  source.add(velocity);
}

export function getSignedAngleBetweenVectors(
  v1: Vector3,
  v2: Vector3,
  normal: Vector3 = new Vector3(0, 1, 0),
  dotTreshold: number = 0.0005
): number {
  let angle = getAngleBetweenVectors(v1, v2, dotTreshold);

  // Get vector pointing up or down
  let cross = new Vector3().crossVectors(v1, v2);
  // Compare cross with normal to find out direction
  if (normal.dot(cross) < 0) {
    angle = -angle;
  }

  return angle;
}

/**
 * Finds an angle between two vectors
 * @param {Vector3} v1
 * @param {Vector3} v2
 */
export function getAngleBetweenVectors(
  v1: Vector3,
  v2: Vector3,
  dotTreshold: number = 0.0005
): number {
  let angle: number;
  let dot = v1.dot(v2);

  // If dot is close to 1, we'll round angle to zero
  if (dot > 1 - dotTreshold) {
    angle = 0;
  } else {
    // Dot too close to -1
    if (dot < -1 + dotTreshold) {
      angle = Math.PI;
    } else {
      // Get angle difference in radians
      angle = Math.acos(dot);
    }
  }

  return angle;
}

/**
 * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
 * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
 * Useful for character rotation, as it only happens on the Y axis.
 * @param {Vector3} a Vector to construct 2D matrix from
 * @param {Vector3} b Vector to apply basis to
 */
export function appplyVectorMatrixXZ(a: Vector3, b: Vector3): Vector3 {
  return new Vector3(a.x * b.z + a.z * b.x, b.y, a.z * b.z + -a.x * b.x);
}

export function fixedVec3(vec: Vector3) {
  return new Vector3(+vec.x.toFixed(2), +vec.y.toFixed(2), +vec.z.toFixed(2));
}
export function fixedQuat(quat: Quaternion) {
  return new Quaternion(
    +quat.x.toFixed(2),
    +quat.y.toFixed(2),
    +quat.z.toFixed(2),
    +quat.w.toFixed(2)
  );
}

export function checkDiffVec(vec1: Vector3, vec2: Vector3) {
  if (
    Math.abs(vec1.x - vec2.x) +
      Math.abs(vec1.y - vec2.y) +
      Math.abs(vec1.z - vec2.z) >
    0.005
  ) {
    return true;
  }
  return false;
}
export function checkDiffQuat(quat1: Quaternion, quat2: Quaternion) {
  if (
    Math.abs(quat1.x - quat2.x) +
      Math.abs(quat1.y - quat2.y) +
      Math.abs(quat1.z - quat2.z) +
      Math.abs(quat1.w - quat2.w) >
    0.005
  ) {
    return true;
  }
  return false;
}

export function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

export function lerpVector(start: Vector3, end: Vector3, amt: number) {
  const lx = (1 - amt) * start.x + amt * end.x;
  const ly = (1 - amt) * start.y + amt * end.y;
  const lz = (1 - amt) * start.z + amt * end.z;
  return new Vector3(lx, ly, lz);
}

export function clampNumber(num: number, min: number, max: number) {
  return Math.max(Math.min(num, Math.max(min, max)), Math.min(min, max));
}

export function characterStateFactory(
  stateName: CharStateType,
  character: Character
) {
  switch (stateName) {
    case CharStateType.Idle:
      return new Idle(character);
    case CharStateType.Walk:
      return new Walk(character);
    case CharStateType.Run:
      return new Run(character);
    default:
      return new Idle(character);
  }
}
