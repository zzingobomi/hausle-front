// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 1.0.45
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Transform } from './Transform'
import { PlayerState } from './PlayerState'

export class Player extends Schema {
    @type(Transform) public transform: Transform = new Transform();
    @type(PlayerState) public state: PlayerState = new PlayerState();
    @type("string") public nickname!: string;
}
