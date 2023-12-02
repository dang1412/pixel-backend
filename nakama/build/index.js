var TextEncoder = function () {
  function TextEncoder() {}
  TextEncoder.prototype.encode = function (input) {
    var utf8 = unescape(encodeURIComponent(input));
    var result = new Uint8Array(utf8.length);
    for (var i = 0; i < utf8.length; i++) {
      result[i] = utf8.charCodeAt(i);
    }
    return result;
  };
  return TextEncoder;
}();
var TextDecoder = function () {
  function TextDecoder() {}
  TextDecoder.prototype.decode = function (input) {
    var bytes = new Uint8Array(input);
    var result = '';
    for (var i = 0; i < bytes.length; i++) {
      result += String.fromCharCode(bytes[i]);
    }
    try {
      return decodeURIComponent(escape(result));
    } catch (e) {
      throw new Error('The encoded data was not valid.');
    }
  };
  return TextDecoder;
}();

var SIZEOF_SHORT = 2;
var SIZEOF_INT = 4;
var FILE_IDENTIFIER_LENGTH = 4;
var SIZE_PREFIX_LENGTH = 4;

var int32 = new Int32Array(2);
var float32 = new Float32Array(int32.buffer);
var float64 = new Float64Array(int32.buffer);
var isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;

var Encoding;
(function (Encoding) {
  Encoding[Encoding["UTF8_BYTES"] = 1] = "UTF8_BYTES";
  Encoding[Encoding["UTF16_STRING"] = 2] = "UTF16_STRING";
})(Encoding || (Encoding = {}));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

var ByteBuffer = /*#__PURE__*/function () {
  /**
   * Create a new ByteBuffer with a given array of bytes (`Uint8Array`)
   */
  function ByteBuffer(bytes_) {
    _classCallCheck(this, ByteBuffer);
    this.bytes_ = bytes_;
    this.position_ = 0;
    this.text_decoder_ = new TextDecoder();
  }
  /**
   * Create and allocate a new ByteBuffer with a given size.
   */
  _createClass(ByteBuffer, [{
    key: "clear",
    value: function clear() {
      this.position_ = 0;
    }
    /**
     * Get the underlying `Uint8Array`.
     */
  }, {
    key: "bytes",
    value: function bytes() {
      return this.bytes_;
    }
    /**
     * Get the buffer's position.
     */
  }, {
    key: "position",
    value: function position() {
      return this.position_;
    }
    /**
     * Set the buffer's position.
     */
  }, {
    key: "setPosition",
    value: function setPosition(position) {
      this.position_ = position;
    }
    /**
     * Get the buffer's capacity.
     */
  }, {
    key: "capacity",
    value: function capacity() {
      return this.bytes_.length;
    }
  }, {
    key: "readInt8",
    value: function readInt8(offset) {
      return this.readUint8(offset) << 24 >> 24;
    }
  }, {
    key: "readUint8",
    value: function readUint8(offset) {
      return this.bytes_[offset];
    }
  }, {
    key: "readInt16",
    value: function readInt16(offset) {
      return this.readUint16(offset) << 16 >> 16;
    }
  }, {
    key: "readUint16",
    value: function readUint16(offset) {
      return this.bytes_[offset] | this.bytes_[offset + 1] << 8;
    }
  }, {
    key: "readInt32",
    value: function readInt32(offset) {
      return this.bytes_[offset] | this.bytes_[offset + 1] << 8 | this.bytes_[offset + 2] << 16 | this.bytes_[offset + 3] << 24;
    }
  }, {
    key: "readUint32",
    value: function readUint32(offset) {
      return this.readInt32(offset) >>> 0;
    }
  }, {
    key: "readInt64",
    value: function readInt64(offset) {
      return BigInt.asIntN(64, BigInt(this.readUint32(offset)) + (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
  }, {
    key: "readUint64",
    value: function readUint64(offset) {
      return BigInt.asUintN(64, BigInt(this.readUint32(offset)) + (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
  }, {
    key: "readFloat32",
    value: function readFloat32(offset) {
      int32[0] = this.readInt32(offset);
      return float32[0];
    }
  }, {
    key: "readFloat64",
    value: function readFloat64(offset) {
      int32[isLittleEndian ? 0 : 1] = this.readInt32(offset);
      int32[isLittleEndian ? 1 : 0] = this.readInt32(offset + 4);
      return float64[0];
    }
  }, {
    key: "writeInt8",
    value: function writeInt8(offset, value) {
      this.bytes_[offset] = value;
    }
  }, {
    key: "writeUint8",
    value: function writeUint8(offset, value) {
      this.bytes_[offset] = value;
    }
  }, {
    key: "writeInt16",
    value: function writeInt16(offset, value) {
      this.bytes_[offset] = value;
      this.bytes_[offset + 1] = value >> 8;
    }
  }, {
    key: "writeUint16",
    value: function writeUint16(offset, value) {
      this.bytes_[offset] = value;
      this.bytes_[offset + 1] = value >> 8;
    }
  }, {
    key: "writeInt32",
    value: function writeInt32(offset, value) {
      this.bytes_[offset] = value;
      this.bytes_[offset + 1] = value >> 8;
      this.bytes_[offset + 2] = value >> 16;
      this.bytes_[offset + 3] = value >> 24;
    }
  }, {
    key: "writeUint32",
    value: function writeUint32(offset, value) {
      this.bytes_[offset] = value;
      this.bytes_[offset + 1] = value >> 8;
      this.bytes_[offset + 2] = value >> 16;
      this.bytes_[offset + 3] = value >> 24;
    }
  }, {
    key: "writeInt64",
    value: function writeInt64(offset, value) {
      this.writeInt32(offset, Number(BigInt.asIntN(32, value)));
      this.writeInt32(offset + 4, Number(BigInt.asIntN(32, value >> BigInt(32))));
    }
  }, {
    key: "writeUint64",
    value: function writeUint64(offset, value) {
      this.writeUint32(offset, Number(BigInt.asUintN(32, value)));
      this.writeUint32(offset + 4, Number(BigInt.asUintN(32, value >> BigInt(32))));
    }
  }, {
    key: "writeFloat32",
    value: function writeFloat32(offset, value) {
      float32[0] = value;
      this.writeInt32(offset, int32[0]);
    }
  }, {
    key: "writeFloat64",
    value: function writeFloat64(offset, value) {
      float64[0] = value;
      this.writeInt32(offset, int32[isLittleEndian ? 0 : 1]);
      this.writeInt32(offset + 4, int32[isLittleEndian ? 1 : 0]);
    }
    /**
     * Return the file identifier.   Behavior is undefined for FlatBuffers whose
     * schema does not include a file_identifier (likely points at padding or the
     * start of a the root vtable).
     */
  }, {
    key: "getBufferIdentifier",
    value: function getBufferIdentifier() {
      if (this.bytes_.length < this.position_ + SIZEOF_INT + FILE_IDENTIFIER_LENGTH) {
        throw new Error('FlatBuffers: ByteBuffer is too short to contain an identifier.');
      }
      var result = "";
      for (var i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
        result += String.fromCharCode(this.readInt8(this.position_ + SIZEOF_INT + i));
      }
      return result;
    }
    /**
     * Look up a field in the vtable, return an offset into the object, or 0 if the
     * field is not present.
     */
  }, {
    key: "__offset",
    value: function __offset(bb_pos, vtable_offset) {
      var vtable = bb_pos - this.readInt32(bb_pos);
      return vtable_offset < this.readInt16(vtable) ? this.readInt16(vtable + vtable_offset) : 0;
    }
    /**
     * Initialize any Table-derived type to point to the union at the given offset.
     */
  }, {
    key: "__union",
    value: function __union(t, offset) {
      t.bb_pos = offset + this.readInt32(offset);
      t.bb = this;
      return t;
    }
    /**
     * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
     * This allocates a new string and converts to wide chars upon each access.
     *
     * To avoid the conversion to string, pass Encoding.UTF8_BYTES as the
     * "optionalEncoding" argument. This is useful for avoiding conversion when
     * the data will just be packaged back up in another FlatBuffer later on.
     *
     * @param offset
     * @param opt_encoding Defaults to UTF16_STRING
     */
  }, {
    key: "__string",
    value: function __string(offset, opt_encoding) {
      offset += this.readInt32(offset);
      var length = this.readInt32(offset);
      offset += SIZEOF_INT;
      var utf8bytes = this.bytes_.subarray(offset, offset + length);
      if (opt_encoding === Encoding.UTF8_BYTES) return utf8bytes;else return this.text_decoder_.decode(utf8bytes);
    }
    /**
     * Handle unions that can contain string as its member, if a Table-derived type then initialize it,
     * if a string then return a new one
     *
     * WARNING: strings are immutable in JS so we can't change the string that the user gave us, this
     * makes the behaviour of __union_with_string different compared to __union
     */
  }, {
    key: "__union_with_string",
    value: function __union_with_string(o, offset) {
      if (typeof o === 'string') {
        return this.__string(offset);
      }
      return this.__union(o, offset);
    }
    /**
     * Retrieve the relative offset stored at "offset"
     */
  }, {
    key: "__indirect",
    value: function __indirect(offset) {
      return offset + this.readInt32(offset);
    }
    /**
     * Get the start of data of a vector whose offset is stored at "offset" in this object.
     */
  }, {
    key: "__vector",
    value: function __vector(offset) {
      return offset + this.readInt32(offset) + SIZEOF_INT; // data starts after the length
    }
    /**
     * Get the length of a vector whose offset is stored at "offset" in this object.
     */
  }, {
    key: "__vector_len",
    value: function __vector_len(offset) {
      return this.readInt32(offset + this.readInt32(offset));
    }
  }, {
    key: "__has_identifier",
    value: function __has_identifier(ident) {
      if (ident.length != FILE_IDENTIFIER_LENGTH) {
        throw new Error('FlatBuffers: file identifier must be length ' + FILE_IDENTIFIER_LENGTH);
      }
      for (var i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
        if (ident.charCodeAt(i) != this.readInt8(this.position() + SIZEOF_INT + i)) {
          return false;
        }
      }
      return true;
    }
    /**
     * A helper function for generating list for obj api
     */
  }, {
    key: "createScalarList",
    value: function createScalarList(listAccessor, listLength) {
      var ret = [];
      for (var i = 0; i < listLength; ++i) {
        var val = listAccessor(i);
        if (val !== null) {
          ret.push(val);
        }
      }
      return ret;
    }
    /**
     * A helper function for generating list for obj api
     * @param listAccessor function that accepts an index and return data at that index
     * @param listLength listLength
     * @param res result list
     */
  }, {
    key: "createObjList",
    value: function createObjList(listAccessor, listLength) {
      var ret = [];
      for (var i = 0; i < listLength; ++i) {
        var val = listAccessor(i);
        if (val !== null) {
          ret.push(val.unpack());
        }
      }
      return ret;
    }
  }], [{
    key: "allocate",
    value: function allocate(byte_size) {
      return new ByteBuffer(new Uint8Array(byte_size));
    }
  }]);
  return ByteBuffer;
}();

var Builder = /*#__PURE__*/function () {
  /**
   * Create a FlatBufferBuilder.
   */
  function Builder(opt_initial_size) {
    _classCallCheck(this, Builder);
    /** Minimum alignment encountered so far. */
    this.minalign = 1;
    /** The vtable for the current table. */
    this.vtable = null;
    /** The amount of fields we're actually using. */
    this.vtable_in_use = 0;
    /** Whether we are currently serializing a table. */
    this.isNested = false;
    /** Starting offset of the current struct/table. */
    this.object_start = 0;
    /** List of offsets of all vtables. */
    this.vtables = [];
    /** For the current vector being built. */
    this.vector_num_elems = 0;
    /** False omits default values from the serialized data */
    this.force_defaults = false;
    this.string_maps = null;
    this.text_encoder = new TextEncoder();
    var initial_size;
    if (!opt_initial_size) {
      initial_size = 1024;
    } else {
      initial_size = opt_initial_size;
    }
    /**
     * @type {ByteBuffer}
     * @private
     */
    this.bb = ByteBuffer.allocate(initial_size);
    this.space = initial_size;
  }
  _createClass(Builder, [{
    key: "clear",
    value: function clear() {
      this.bb.clear();
      this.space = this.bb.capacity();
      this.minalign = 1;
      this.vtable = null;
      this.vtable_in_use = 0;
      this.isNested = false;
      this.object_start = 0;
      this.vtables = [];
      this.vector_num_elems = 0;
      this.force_defaults = false;
      this.string_maps = null;
    }
    /**
     * In order to save space, fields that are set to their default value
     * don't get serialized into the buffer. Forcing defaults provides a
     * way to manually disable this optimization.
     *
     * @param forceDefaults true always serializes default values
     */
  }, {
    key: "forceDefaults",
    value: function forceDefaults(_forceDefaults) {
      this.force_defaults = _forceDefaults;
    }
    /**
     * Get the ByteBuffer representing the FlatBuffer. Only call this after you've
     * called finish(). The actual data starts at the ByteBuffer's current position,
     * not necessarily at 0.
     */
  }, {
    key: "dataBuffer",
    value: function dataBuffer() {
      return this.bb;
    }
    /**
     * Get the bytes representing the FlatBuffer. Only call this after you've
     * called finish().
     */
  }, {
    key: "asUint8Array",
    value: function asUint8Array() {
      return this.bb.bytes().subarray(this.bb.position(), this.bb.position() + this.offset());
    }
    /**
     * Prepare to write an element of `size` after `additional_bytes` have been
     * written, e.g. if you write a string, you need to align such the int length
     * field is aligned to 4 bytes, and the string data follows it directly. If all
     * you need to do is alignment, `additional_bytes` will be 0.
     *
     * @param size This is the of the new element to write
     * @param additional_bytes The padding size
     */
  }, {
    key: "prep",
    value: function prep(size, additional_bytes) {
      // Track the biggest thing we've ever aligned to.
      if (size > this.minalign) {
        this.minalign = size;
      }
      // Find the amount of alignment needed such that `size` is properly
      // aligned after `additional_bytes`
      var align_size = ~(this.bb.capacity() - this.space + additional_bytes) + 1 & size - 1;
      // Reallocate the buffer if needed.
      while (this.space < align_size + size + additional_bytes) {
        var old_buf_size = this.bb.capacity();
        this.bb = Builder.growByteBuffer(this.bb);
        this.space += this.bb.capacity() - old_buf_size;
      }
      this.pad(align_size);
    }
  }, {
    key: "pad",
    value: function pad(byte_size) {
      for (var i = 0; i < byte_size; i++) {
        this.bb.writeInt8(--this.space, 0);
      }
    }
  }, {
    key: "writeInt8",
    value: function writeInt8(value) {
      this.bb.writeInt8(this.space -= 1, value);
    }
  }, {
    key: "writeInt16",
    value: function writeInt16(value) {
      this.bb.writeInt16(this.space -= 2, value);
    }
  }, {
    key: "writeInt32",
    value: function writeInt32(value) {
      this.bb.writeInt32(this.space -= 4, value);
    }
  }, {
    key: "writeInt64",
    value: function writeInt64(value) {
      this.bb.writeInt64(this.space -= 8, value);
    }
  }, {
    key: "writeFloat32",
    value: function writeFloat32(value) {
      this.bb.writeFloat32(this.space -= 4, value);
    }
  }, {
    key: "writeFloat64",
    value: function writeFloat64(value) {
      this.bb.writeFloat64(this.space -= 8, value);
    }
    /**
     * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int8` to add the buffer.
     */
  }, {
    key: "addInt8",
    value: function addInt8(value) {
      this.prep(1, 0);
      this.writeInt8(value);
    }
    /**
     * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int16` to add the buffer.
     */
  }, {
    key: "addInt16",
    value: function addInt16(value) {
      this.prep(2, 0);
      this.writeInt16(value);
    }
    /**
     * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int32` to add the buffer.
     */
  }, {
    key: "addInt32",
    value: function addInt32(value) {
      this.prep(4, 0);
      this.writeInt32(value);
    }
    /**
     * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int64` to add the buffer.
     */
  }, {
    key: "addInt64",
    value: function addInt64(value) {
      this.prep(8, 0);
      this.writeInt64(value);
    }
    /**
     * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float32` to add the buffer.
     */
  }, {
    key: "addFloat32",
    value: function addFloat32(value) {
      this.prep(4, 0);
      this.writeFloat32(value);
    }
    /**
     * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float64` to add the buffer.
     */
  }, {
    key: "addFloat64",
    value: function addFloat64(value) {
      this.prep(8, 0);
      this.writeFloat64(value);
    }
  }, {
    key: "addFieldInt8",
    value: function addFieldInt8(voffset, value, defaultValue) {
      if (this.force_defaults || value != defaultValue) {
        this.addInt8(value);
        this.slot(voffset);
      }
    }
  }, {
    key: "addFieldInt16",
    value: function addFieldInt16(voffset, value, defaultValue) {
      if (this.force_defaults || value != defaultValue) {
        this.addInt16(value);
        this.slot(voffset);
      }
    }
  }, {
    key: "addFieldInt32",
    value: function addFieldInt32(voffset, value, defaultValue) {
      if (this.force_defaults || value != defaultValue) {
        this.addInt32(value);
        this.slot(voffset);
      }
    }
  }, {
    key: "addFieldInt64",
    value: function addFieldInt64(voffset, value, defaultValue) {
      if (this.force_defaults || value !== defaultValue) {
        this.addInt64(value);
        this.slot(voffset);
      }
    }
  }, {
    key: "addFieldFloat32",
    value: function addFieldFloat32(voffset, value, defaultValue) {
      if (this.force_defaults || value != defaultValue) {
        this.addFloat32(value);
        this.slot(voffset);
      }
    }
  }, {
    key: "addFieldFloat64",
    value: function addFieldFloat64(voffset, value, defaultValue) {
      if (this.force_defaults || value != defaultValue) {
        this.addFloat64(value);
        this.slot(voffset);
      }
    }
  }, {
    key: "addFieldOffset",
    value: function addFieldOffset(voffset, value, defaultValue) {
      if (this.force_defaults || value != defaultValue) {
        this.addOffset(value);
        this.slot(voffset);
      }
    }
    /**
     * Structs are stored inline, so nothing additional is being added. `d` is always 0.
     */
  }, {
    key: "addFieldStruct",
    value: function addFieldStruct(voffset, value, defaultValue) {
      if (value != defaultValue) {
        this.nested(value);
        this.slot(voffset);
      }
    }
    /**
     * Structures are always stored inline, they need to be created right
     * where they're used.  You'll get this assertion failure if you
     * created it elsewhere.
     */
  }, {
    key: "nested",
    value: function nested(obj) {
      if (obj != this.offset()) {
        throw new TypeError('FlatBuffers: struct must be serialized inline.');
      }
    }
    /**
     * Should not be creating any other object, string or vector
     * while an object is being constructed
     */
  }, {
    key: "notNested",
    value: function notNested() {
      if (this.isNested) {
        throw new TypeError('FlatBuffers: object serialization must not be nested.');
      }
    }
    /**
     * Set the current vtable at `voffset` to the current location in the buffer.
     */
  }, {
    key: "slot",
    value: function slot(voffset) {
      if (this.vtable !== null) this.vtable[voffset] = this.offset();
    }
    /**
     * @returns Offset relative to the end of the buffer.
     */
  }, {
    key: "offset",
    value: function offset() {
      return this.bb.capacity() - this.space;
    }
    /**
     * Doubles the size of the backing ByteBuffer and copies the old data towards
     * the end of the new buffer (since we build the buffer backwards).
     *
     * @param bb The current buffer with the existing data
     * @returns A new byte buffer with the old data copied
     * to it. The data is located at the end of the buffer.
     *
     * uint8Array.set() formally takes {Array<number>|ArrayBufferView}, so to pass
     * it a uint8Array we need to suppress the type check:
     * @suppress {checkTypes}
     */
  }, {
    key: "addOffset",
    value:
    /**
     * Adds on offset, relative to where it will be written.
     *
     * @param offset The offset to add.
     */
    function addOffset(offset) {
      this.prep(SIZEOF_INT, 0); // Ensure alignment is already done.
      this.writeInt32(this.offset() - offset + SIZEOF_INT);
    }
    /**
     * Start encoding a new object in the buffer.  Users will not usually need to
     * call this directly. The FlatBuffers compiler will generate helper methods
     * that call this method internally.
     */
  }, {
    key: "startObject",
    value: function startObject(numfields) {
      this.notNested();
      if (this.vtable == null) {
        this.vtable = [];
      }
      this.vtable_in_use = numfields;
      for (var i = 0; i < numfields; i++) {
        this.vtable[i] = 0; // This will push additional elements as needed
      }

      this.isNested = true;
      this.object_start = this.offset();
    }
    /**
     * Finish off writing the object that is under construction.
     *
     * @returns The offset to the object inside `dataBuffer`
     */
  }, {
    key: "endObject",
    value: function endObject() {
      if (this.vtable == null || !this.isNested) {
        throw new Error('FlatBuffers: endObject called without startObject');
      }
      this.addInt32(0);
      var vtableloc = this.offset();
      // Trim trailing zeroes.
      var i = this.vtable_in_use - 1;
      // eslint-disable-next-line no-empty
      for (; i >= 0 && this.vtable[i] == 0; i--) {}
      var trimmed_size = i + 1;
      // Write out the current vtable.
      for (; i >= 0; i--) {
        // Offset relative to the start of the table.
        this.addInt16(this.vtable[i] != 0 ? vtableloc - this.vtable[i] : 0);
      }
      var standard_fields = 2; // The fields below:
      this.addInt16(vtableloc - this.object_start);
      var len = (trimmed_size + standard_fields) * SIZEOF_SHORT;
      this.addInt16(len);
      // Search for an existing vtable that matches the current one.
      var existing_vtable = 0;
      var vt1 = this.space;
      outer_loop: for (i = 0; i < this.vtables.length; i++) {
        var vt2 = this.bb.capacity() - this.vtables[i];
        if (len == this.bb.readInt16(vt2)) {
          for (var j = SIZEOF_SHORT; j < len; j += SIZEOF_SHORT) {
            if (this.bb.readInt16(vt1 + j) != this.bb.readInt16(vt2 + j)) {
              continue outer_loop;
            }
          }
          existing_vtable = this.vtables[i];
          break;
        }
      }
      if (existing_vtable) {
        // Found a match:
        // Remove the current vtable.
        this.space = this.bb.capacity() - vtableloc;
        // Point table to existing vtable.
        this.bb.writeInt32(this.space, existing_vtable - vtableloc);
      } else {
        // No match:
        // Add the location of the current vtable to the list of vtables.
        this.vtables.push(this.offset());
        // Point table to current vtable.
        this.bb.writeInt32(this.bb.capacity() - vtableloc, this.offset() - vtableloc);
      }
      this.isNested = false;
      return vtableloc;
    }
    /**
     * Finalize a buffer, poiting to the given `root_table`.
     */
  }, {
    key: "finish",
    value: function finish(root_table, opt_file_identifier, opt_size_prefix) {
      var size_prefix = opt_size_prefix ? SIZE_PREFIX_LENGTH : 0;
      if (opt_file_identifier) {
        var file_identifier = opt_file_identifier;
        this.prep(this.minalign, SIZEOF_INT + FILE_IDENTIFIER_LENGTH + size_prefix);
        if (file_identifier.length != FILE_IDENTIFIER_LENGTH) {
          throw new TypeError('FlatBuffers: file identifier must be length ' + FILE_IDENTIFIER_LENGTH);
        }
        for (var i = FILE_IDENTIFIER_LENGTH - 1; i >= 0; i--) {
          this.writeInt8(file_identifier.charCodeAt(i));
        }
      }
      this.prep(this.minalign, SIZEOF_INT + size_prefix);
      this.addOffset(root_table);
      if (size_prefix) {
        this.addInt32(this.bb.capacity() - this.space);
      }
      this.bb.setPosition(this.space);
    }
    /**
     * Finalize a size prefixed buffer, pointing to the given `root_table`.
     */
  }, {
    key: "finishSizePrefixed",
    value: function finishSizePrefixed(root_table, opt_file_identifier) {
      this.finish(root_table, opt_file_identifier, true);
    }
    /**
     * This checks a required field has been set in a given table that has
     * just been constructed.
     */
  }, {
    key: "requiredField",
    value: function requiredField(table, field) {
      var table_start = this.bb.capacity() - table;
      var vtable_start = table_start - this.bb.readInt32(table_start);
      var ok = field < this.bb.readInt16(vtable_start) && this.bb.readInt16(vtable_start + field) != 0;
      // If this fails, the caller will show what field needs to be set.
      if (!ok) {
        throw new TypeError('FlatBuffers: field ' + field + ' must be set');
      }
    }
    /**
     * Start a new array/vector of objects.  Users usually will not call
     * this directly. The FlatBuffers compiler will create a start/end
     * method for vector types in generated code.
     *
     * @param elem_size The size of each element in the array
     * @param num_elems The number of elements in the array
     * @param alignment The alignment of the array
     */
  }, {
    key: "startVector",
    value: function startVector(elem_size, num_elems, alignment) {
      this.notNested();
      this.vector_num_elems = num_elems;
      this.prep(SIZEOF_INT, elem_size * num_elems);
      this.prep(alignment, elem_size * num_elems); // Just in case alignment > int.
    }
    /**
     * Finish off the creation of an array and all its elements. The array must be
     * created with `startVector`.
     *
     * @returns The offset at which the newly created array
     * starts.
     */
  }, {
    key: "endVector",
    value: function endVector() {
      this.writeInt32(this.vector_num_elems);
      return this.offset();
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If the string passed has
     * already been seen, we return the offset of the already written string
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
  }, {
    key: "createSharedString",
    value: function createSharedString(s) {
      if (!s) {
        return 0;
      }
      if (!this.string_maps) {
        this.string_maps = new Map();
      }
      if (this.string_maps.has(s)) {
        return this.string_maps.get(s);
      }
      var offset = this.createString(s);
      this.string_maps.set(s, offset);
      return offset;
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
     * instead of a string, it is assumed to contain valid UTF-8 encoded data.
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
  }, {
    key: "createString",
    value: function createString(s) {
      if (s === null || s === undefined) {
        return 0;
      }
      var utf8;
      if (s instanceof Uint8Array) {
        utf8 = s;
      } else {
        utf8 = this.text_encoder.encode(s);
      }
      this.addInt8(0);
      this.startVector(1, utf8.length, 1);
      this.bb.setPosition(this.space -= utf8.length);
      for (var i = 0, offset = this.space, bytes = this.bb.bytes(); i < utf8.length; i++) {
        bytes[offset++] = utf8[i];
      }
      return this.endVector();
    }
    /**
     * A helper function to pack an object
     *
     * @returns offset of obj
     */
  }, {
    key: "createObjectOffset",
    value: function createObjectOffset(obj) {
      if (obj === null) {
        return 0;
      }
      if (typeof obj === 'string') {
        return this.createString(obj);
      } else {
        return obj.pack(this);
      }
    }
    /**
     * A helper function to pack a list of object
     *
     * @returns list of offsets of each non null object
     */
  }, {
    key: "createObjectOffsetList",
    value: function createObjectOffsetList(list) {
      var ret = [];
      for (var i = 0; i < list.length; ++i) {
        var val = list[i];
        if (val !== null) {
          ret.push(this.createObjectOffset(val));
        } else {
          throw new TypeError('FlatBuffers: Argument for createObjectOffsetList cannot contain null.');
        }
      }
      return ret;
    }
  }, {
    key: "createStructOffsetList",
    value: function createStructOffsetList(list, startFunc) {
      startFunc(this, list.length);
      this.createObjectOffsetList(list.slice().reverse());
      return this.endVector();
    }
  }], [{
    key: "growByteBuffer",
    value: function growByteBuffer(bb) {
      var old_buf_size = bb.capacity();
      // Ensure we don't grow beyond what fits in an int.
      if (old_buf_size & 0xC0000000) {
        throw new Error('FlatBuffers: cannot grow buffer beyond 2 gigabytes.');
      }
      var new_buf_size = old_buf_size << 1;
      var nbb = ByteBuffer.allocate(new_buf_size);
      nbb.setPosition(new_buf_size - old_buf_size);
      nbb.bytes().set(bb.bytes(), new_buf_size - old_buf_size);
      return nbb;
    }
  }]);
  return Builder;
}();

var BeastAction = function () {
  function BeastAction() {
    this.bb = null;
    this.bb_pos = 0;
  }
  BeastAction.prototype.__init = function (i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  };
  BeastAction.prototype.id = function () {
    return this.bb.readInt32(this.bb_pos);
  };
  BeastAction.prototype.target = function () {
    return this.bb.readInt32(this.bb_pos + 4);
  };
  BeastAction.sizeOf = function () {
    return 8;
  };
  BeastAction.createBeastAction = function (builder, id, target) {
    builder.prep(4, 8);
    builder.writeInt32(target);
    builder.writeInt32(id);
    return builder.offset();
  };
  return BeastAction;
}();

var UpdateState = function () {
  function UpdateState() {
    this.bb = null;
    this.bb_pos = 0;
  }
  UpdateState.prototype.__init = function (i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  };
  UpdateState.getRootAsUpdateState = function (bb, obj) {
    return (obj || new UpdateState()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  };
  UpdateState.getSizePrefixedRootAsUpdateState = function (bb, obj) {
    bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
    return (obj || new UpdateState()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  };
  UpdateState.prototype.beastMoves = function (index, obj) {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? (obj || new BeastAction()).__init(this.bb.__vector(this.bb_pos + offset) + index * 8, this.bb) : null;
  };
  UpdateState.prototype.beastMovesLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.beastShoots = function (index, obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? (obj || new BeastAction()).__init(this.bb.__vector(this.bb_pos + offset) + index * 8, this.bb) : null;
  };
  UpdateState.prototype.beastShootsLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.beastDeaths = function (index) {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readInt32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  };
  UpdateState.prototype.beastDeathsLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.beastDeathsArray = function () {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? new Int32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  };
  UpdateState.startUpdateState = function (builder) {
    builder.startObject(3);
  };
  UpdateState.addBeastMoves = function (builder, beastMovesOffset) {
    builder.addFieldOffset(0, beastMovesOffset, 0);
  };
  UpdateState.startBeastMovesVector = function (builder, numElems) {
    builder.startVector(8, numElems, 4);
  };
  UpdateState.addBeastShoots = function (builder, beastShootsOffset) {
    builder.addFieldOffset(1, beastShootsOffset, 0);
  };
  UpdateState.startBeastShootsVector = function (builder, numElems) {
    builder.startVector(8, numElems, 4);
  };
  UpdateState.addBeastDeaths = function (builder, beastDeathsOffset) {
    builder.addFieldOffset(2, beastDeathsOffset, 0);
  };
  UpdateState.createBeastDeathsVector = function (builder, data) {
    builder.startVector(4, data.length, 4);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addInt32(data[i]);
    }
    return builder.endVector();
  };
  UpdateState.startBeastDeathsVector = function (builder, numElems) {
    builder.startVector(4, numElems, 4);
  };
  UpdateState.endUpdateState = function (builder) {
    var offset = builder.endObject();
    return offset;
  };
  UpdateState.finishUpdateStateBuffer = function (builder, offset) {
    builder.finish(offset);
  };
  UpdateState.finishSizePrefixedUpdateStateBuffer = function (builder, offset) {
    builder.finish(offset, undefined, true);
  };
  UpdateState.createUpdateState = function (builder, beastMovesOffset, beastShootsOffset, beastDeathsOffset) {
    UpdateState.startUpdateState(builder);
    UpdateState.addBeastMoves(builder, beastMovesOffset);
    UpdateState.addBeastShoots(builder, beastShootsOffset);
    UpdateState.addBeastDeaths(builder, beastDeathsOffset);
    return UpdateState.endUpdateState(builder);
  };
  return UpdateState;
}();

function matchInit(ctx, logger, nk, params) {
  logger.debug('Lobby match created');
  var presences = {};
  return {
    state: {
      presences: presences,
      beastPosition: {},
      positionBeast: {},
      beastOnboard: []
    },
    tickRate: 1,
    label: 'PixelAdventure'
  };
}
function matchJoinAttempt(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
  logger.debug('%q attempted to join Lobby match', ctx.userId);
  return {
    state: state,
    accept: true
  };
}
function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
  presences.forEach(function (presence) {
    state.presences[presence.userId] = presence;
    logger.info('%q joined Adventure match', presence.userId);
  });
  var positions = Object.keys(state.beastPosition).map(function (id) {
    return Number(id);
  }).map(function (id) {
    return {
      id: id,
      target: state.beastPosition[id]
    };
  });
  var data = encodeMatchUpdate(positions, [], []);
  dispatcher.broadcastMessage(0, data.buffer.slice(data.byteOffset), presences, undefined, true);
  return {
    state: state
  };
}
function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
  presences.forEach(function (presence) {
    delete state.presences[presence.userId];
    logger.info('%q left adventure match', presence.userId);
  });
  return {
    state: state
  };
}
function executeMove(state, move) {
  var id = move.id,
    target = move.target;
  var from = state.beastPosition[id];
  state.beastPosition[id] = target;
  state.positionBeast[target] = id;
  delete state.positionBeast[from];
}
function executeShoot(state, shoot) {
  var target = shoot.target;
  if (state.positionBeast[target] >= 0) {
    var die = state.positionBeast[target];
    delete state.positionBeast[target];
    delete state.beastPosition[die];
    return die;
  }
  return undefined;
}
function matchUpdate(state, moves, shoots) {
  var executedMoves = [];
  for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
    var move = moves_1[_i];
    var target = move.target;
    if (state.positionBeast[target] === undefined) {
      executeMove(state, move);
      executedMoves.push(move);
    }
  }
  var executedShoots = [];
  var beastGone = [];
  for (var _a = 0, shoots_1 = shoots; _a < shoots_1.length; _a++) {
    var shoot = shoots_1[_a];
    var id = shoot.id;
    if (state.beastPosition[id] >= 0) {
      var die = executeShoot(state, shoot);
      executedShoots.push(shoot);
      if (die) {
        beastGone.push(die);
      }
    }
  }
  return {
    executedMoves: executedMoves,
    executedShoots: executedShoots,
    beastGone: beastGone
  };
}
function encodeMatchUpdate(executedMoves, executedShoots, beastGone) {
  var builder = new Builder(128);
  UpdateState.startBeastMovesVector(builder, executedMoves.length);
  for (var _i = 0, executedMoves_1 = executedMoves; _i < executedMoves_1.length; _i++) {
    var move = executedMoves_1[_i];
    BeastAction.createBeastAction(builder, move.id, move.target);
  }
  var moves = builder.endVector();
  UpdateState.startBeastShootsVector(builder, executedShoots.length);
  for (var _a = 0, executedShoots_1 = executedShoots; _a < executedShoots_1.length; _a++) {
    var shoot = executedShoots_1[_a];
    BeastAction.createBeastAction(builder, shoot.id, shoot.target);
  }
  var shoots = builder.endVector();
  var deaths = UpdateState.createBeastDeathsVector(builder, beastGone);
  UpdateState.startUpdateState(builder);
  UpdateState.addBeastMoves(builder, moves);
  UpdateState.addBeastShoots(builder, shoots);
  UpdateState.addBeastDeaths(builder, deaths);
  var end = UpdateState.endUpdateState(builder);
  builder.finish(end);
  return builder.asUint8Array();
}
function decodeAction(data) {
  var buffer = data.buffer;
  var view = new DataView(buffer);
  var id = view.getInt32(0, true);
  var target = view.getInt32(4, true);
  return {
    id: id,
    target: target
  };
}
function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
  var moves = [];
  var shoots = [];
  messages.forEach(function (message) {
    var beastAction = decodeAction(new Uint8Array(message.data));
    if (message.opCode === 0) {
      moves.push(beastAction);
    } else {
      shoots.push(beastAction);
    }
    logger.info('Received action %v', beastAction, message.opCode);
  });
  var _a = matchUpdate(state, moves, shoots),
    executedMoves = _a.executedMoves,
    executedShoots = _a.executedShoots,
    beastGone = _a.beastGone;
  if (executedMoves.length || executedShoots.length || beastGone.length) {
    var data = encodeMatchUpdate(executedMoves, executedShoots, beastGone);
    dispatcher.broadcastMessage(1, data.buffer.slice(data.byteOffset));
  }
  return {
    state: state
  };
}
function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
  logger.debug('Lobby match terminated');
  var message = "Server shutting down in ".concat(graceSeconds, " seconds.");
  dispatcher.broadcastMessage(2, message, null, null);
  return {
    state: state
  };
}
function matchSignal(ctx, logger, nk, dispatcher, tick, state, data) {
  logger.debug('Lobby match signal received: ' + data);
  return {
    state: state,
    data: "Lobby match signal received: " + data
  };
}
!TextEncoder && TextEncoder.bind(null);
!TextDecoder && TextDecoder.bind(null);

function InitModule(ctx, logger, nk, initializer) {
  logger.info('Hello World!');
  initializer.registerMatch('adventure_match', {
    matchInit: matchInit,
    matchJoinAttempt: matchJoinAttempt,
    matchJoin: matchJoin,
    matchLeave: matchLeave,
    matchLoop: matchLoop,
    matchSignal: matchSignal,
    matchTerminate: matchTerminate
  });
  nk.matchCreate('adventure_match');
}
!InitModule && InitModule.bind(null);
