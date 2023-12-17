// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { BeastAction } from './beast-action';


export class UpdateState {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):UpdateState {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsUpdateState(bb:flatbuffers.ByteBuffer, obj?:UpdateState):UpdateState {
  return (obj || new UpdateState()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsUpdateState(bb:flatbuffers.ByteBuffer, obj?:UpdateState):UpdateState {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new UpdateState()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

beastMoves(index: number, obj?:BeastAction):BeastAction|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? (obj || new BeastAction()).__init(this.bb!.__vector(this.bb_pos + offset) + index * 12, this.bb!) : null;
}

beastMovesLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

beastShoots(index: number, obj?:BeastAction):BeastAction|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? (obj || new BeastAction()).__init(this.bb!.__vector(this.bb_pos + offset) + index * 12, this.bb!) : null;
}

beastShootsLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

beastChange(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readInt32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
}

beastChangeLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

beastChangeArray():Int32Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? new Int32Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

beastChangeHp(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? this.bb!.readInt16(this.bb!.__vector(this.bb_pos + offset) + index * 2) : 0;
}

beastChangeHpLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

beastChangeHpArray():Int16Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? new Int16Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

beastChangeEquips(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? this.bb!.readInt16(this.bb!.__vector(this.bb_pos + offset) + index * 2) : 0;
}

beastChangeEquipsLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

beastChangeEquipsArray():Int16Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? new Int16Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

pixelChange(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? this.bb!.readInt32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
}

pixelChangeLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

pixelChangeArray():Int32Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? new Int32Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

pixelChangeItems(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 16);
  return offset ? this.bb!.readInt16(this.bb!.__vector(this.bb_pos + offset) + index * 2) : 0;
}

pixelChangeItemsLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 16);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

pixelChangeItemsArray():Int16Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 16);
  return offset ? new Int16Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

static startUpdateState(builder:flatbuffers.Builder) {
  builder.startObject(7);
}

static addBeastMoves(builder:flatbuffers.Builder, beastMovesOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, beastMovesOffset, 0);
}

static startBeastMovesVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(12, numElems, 4);
}

static addBeastShoots(builder:flatbuffers.Builder, beastShootsOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, beastShootsOffset, 0);
}

static startBeastShootsVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(12, numElems, 4);
}

static addBeastChange(builder:flatbuffers.Builder, beastChangeOffset:flatbuffers.Offset) {
  builder.addFieldOffset(2, beastChangeOffset, 0);
}

static createBeastChangeVector(builder:flatbuffers.Builder, data:number[]|Int32Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createBeastChangeVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createBeastChangeVector(builder:flatbuffers.Builder, data:number[]|Int32Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt32(data[i]!);
  }
  return builder.endVector();
}

static startBeastChangeVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static addBeastChangeHp(builder:flatbuffers.Builder, beastChangeHpOffset:flatbuffers.Offset) {
  builder.addFieldOffset(3, beastChangeHpOffset, 0);
}

static createBeastChangeHpVector(builder:flatbuffers.Builder, data:number[]|Int16Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createBeastChangeHpVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createBeastChangeHpVector(builder:flatbuffers.Builder, data:number[]|Int16Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(2, data.length, 2);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt16(data[i]!);
  }
  return builder.endVector();
}

static startBeastChangeHpVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(2, numElems, 2);
}

static addBeastChangeEquips(builder:flatbuffers.Builder, beastChangeEquipsOffset:flatbuffers.Offset) {
  builder.addFieldOffset(4, beastChangeEquipsOffset, 0);
}

static createBeastChangeEquipsVector(builder:flatbuffers.Builder, data:number[]|Int16Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createBeastChangeEquipsVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createBeastChangeEquipsVector(builder:flatbuffers.Builder, data:number[]|Int16Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(2, data.length, 2);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt16(data[i]!);
  }
  return builder.endVector();
}

static startBeastChangeEquipsVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(2, numElems, 2);
}

static addPixelChange(builder:flatbuffers.Builder, pixelChangeOffset:flatbuffers.Offset) {
  builder.addFieldOffset(5, pixelChangeOffset, 0);
}

static createPixelChangeVector(builder:flatbuffers.Builder, data:number[]|Int32Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createPixelChangeVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createPixelChangeVector(builder:flatbuffers.Builder, data:number[]|Int32Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt32(data[i]!);
  }
  return builder.endVector();
}

static startPixelChangeVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static addPixelChangeItems(builder:flatbuffers.Builder, pixelChangeItemsOffset:flatbuffers.Offset) {
  builder.addFieldOffset(6, pixelChangeItemsOffset, 0);
}

static createPixelChangeItemsVector(builder:flatbuffers.Builder, data:number[]|Int16Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createPixelChangeItemsVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createPixelChangeItemsVector(builder:flatbuffers.Builder, data:number[]|Int16Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(2, data.length, 2);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt16(data[i]!);
  }
  return builder.endVector();
}

static startPixelChangeItemsVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(2, numElems, 2);
}

static endUpdateState(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static finishUpdateStateBuffer(builder:flatbuffers.Builder, offset:flatbuffers.Offset) {
  builder.finish(offset);
}

static finishSizePrefixedUpdateStateBuffer(builder:flatbuffers.Builder, offset:flatbuffers.Offset) {
  builder.finish(offset, undefined, true);
}

static createUpdateState(builder:flatbuffers.Builder, beastMovesOffset:flatbuffers.Offset, beastShootsOffset:flatbuffers.Offset, beastChangeOffset:flatbuffers.Offset, beastChangeHpOffset:flatbuffers.Offset, beastChangeEquipsOffset:flatbuffers.Offset, pixelChangeOffset:flatbuffers.Offset, pixelChangeItemsOffset:flatbuffers.Offset):flatbuffers.Offset {
  UpdateState.startUpdateState(builder);
  UpdateState.addBeastMoves(builder, beastMovesOffset);
  UpdateState.addBeastShoots(builder, beastShootsOffset);
  UpdateState.addBeastChange(builder, beastChangeOffset);
  UpdateState.addBeastChangeHp(builder, beastChangeHpOffset);
  UpdateState.addBeastChangeEquips(builder, beastChangeEquipsOffset);
  UpdateState.addPixelChange(builder, pixelChangeOffset);
  UpdateState.addPixelChangeItems(builder, pixelChangeItemsOffset);
  return UpdateState.endUpdateState(builder);
}
}
