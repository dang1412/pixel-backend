// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class BeastAction {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):BeastAction {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

id():number {
  return this.bb!.readInt32(this.bb_pos);
}

target():number {
  return this.bb!.readInt32(this.bb_pos + 4);
}

static sizeOf():number {
  return 8;
}

static createBeastAction(builder:flatbuffers.Builder, id: number, target: number):flatbuffers.Offset {
  builder.prep(4, 8);
  builder.writeInt32(target);
  builder.writeInt32(id);
  return builder.offset();
}

}
