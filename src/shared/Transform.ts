// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 1.0.45
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Vec3 } from './Vec3'
import { Vec4 } from './Vec4'

export class Transform extends Schema {
    @type(Vec3) public position: Vec3 = new Vec3();
    @type(Vec4) public quaternion: Vec4 = new Vec4();
    @type(Vec3) public scale: Vec3 = new Vec3();
}
