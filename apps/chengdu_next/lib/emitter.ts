// lib/emitter.ts
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

const globalAny = global as any;
export const emitterSalt = globalAny.emitterSalt || nanoid();
export const emitter = globalAny.emitter || new EventEmitter();
globalAny.emitterSalt = emitterSalt;
globalAny.emitter = emitter;
