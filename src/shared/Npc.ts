// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 1.0.45
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Transform } from './Transform'
import { NpcState } from './NpcState'

export class Npc extends Schema {
    @type(Transform) public transform: Transform = new Transform();
    @type(NpcState) public state: NpcState = new NpcState();
    @type("string") public nickname!: string;
}
