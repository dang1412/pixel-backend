function encodeControls(characterControls) {
  var buffer = new ArrayBuffer(3 * characterControls.length + 1);
  var view = new DataView(buffer);
  view.setUint8(0, 1);
  for (var i = 0; i < characterControls.length; i++) {
    var characterControl = characterControls[i];
    var firstByte = 0;
    firstByte |= (characterControl.up ? 1 : 0) << 0;
    firstByte |= (characterControl.down ? 1 : 0) << 1;
    firstByte |= (characterControl.left ? 1 : 0) << 2;
    firstByte |= (characterControl.right ? 1 : 0) << 3;
    firstByte |= (characterControl.fire ? 1 : 0) << 4;
    firstByte |= (characterControl.weapon & 0x07) << 5;
    view.setUint8(3 * i + 1, firstByte);
    var secondAndThirdByte = characterControl.angle & 0x03FF;
    secondAndThirdByte |= (characterControl.id & 0x3F) << 10;
    view.setUint16(3 * i + 2, secondAndThirdByte, true);
  }
  return buffer;
}
function decodeControls(buffer) {
  var view = new DataView(buffer);
  var len = (buffer.byteLength - 1) / 3;
  var ctrls = [];
  for (var i = 0; i < len; i++) {
    var firstByte = view.getUint8(3 * i + 1);
    var up = (firstByte & 0x01) !== 0;
    var down = (firstByte & 0x02) !== 0;
    var left = (firstByte & 0x04) !== 0;
    var right = (firstByte & 0x08) !== 0;
    var fire = (firstByte & 0x10) !== 0;
    var weapon = firstByte >> 5 & 0x07;
    var secondAndThirdByte = view.getUint16(3 * i + 2, true);
    var angle = secondAndThirdByte & 0x03FF;
    var id = secondAndThirdByte >> 10 & 0x3F;
    ctrls.push({
      up: up,
      down: down,
      left: left,
      right: right,
      fire: fire,
      weapon: weapon,
      angle: angle,
      id: id
    });
  }
  return ctrls;
}
function encodeAttrsArray(attrsArr) {
  var buffer = new ArrayBuffer(6 * attrsArr.length + 1);
  var view = new DataView(buffer);
  view.setUint8(0, 0);
  for (var i = 0; i < attrsArr.length; i++) {
    var attrs = attrsArr[i];
    view.setUint8(6 * i + 1, attrs.id);
    view.setUint8(6 * i + 2, attrs.hp);
    view.setUint16(6 * i + 3, attrs.x, true);
    view.setUint16(6 * i + 5, attrs.y, true);
  }
  return buffer;
}
function decodeAttrsArray(buffer) {
  var view = new DataView(buffer);
  var len = (buffer.byteLength - 1) / 6;
  var attrsArr = [];
  for (var i = 0; i < len; i++) {
    var id = view.getUint8(6 * i + 1);
    var hp = view.getUint8(6 * i + 2);
    var x = view.getUint16(6 * i + 3, true);
    var y = view.getUint16(6 * i + 5, true);
    attrsArr.push({
      id: id,
      hp: hp,
      x: x,
      y: y
    });
  }
  return attrsArr;
}

var defaultCharacterControl = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  weapon: 1,
  angle: 0,
  id: 0
};

var characterSpeed = 6;
function ctrlEqual(c1, c2) {
  if (!c1 || !c2) return false;
  return c1.angle === c2.angle && c1.down === c2.down && c1.fire === c2.fire && c1.id === c2.id && c1.left === c2.left && c1.right === c2.right && c1.up === c2.up && c1.weapon === c2.weapon;
}
function proceedControls(state, ctrls) {
  var idCtrlMap = {};
  for (var _i = 0, ctrls_1 = ctrls; _i < ctrls_1.length; _i++) {
    var ctrl = ctrls_1[_i];
    var id = ctrl.id;
    if (!ctrlEqual(state.characterCtrlMap[id], ctrl)) {
      state.characterCtrlMap[id] = ctrl;
      idCtrlMap[id] = ctrl;
    }
  }
  return Object.values(idCtrlMap);
}
function proceedGameLoop(state) {
  for (var _i = 0, _a = Object.keys(state.characterAttrsMap); _i < _a.length; _i++) {
    var id = _a[_i];
    proceedGameLoopCharId(state, Number(id));
  }
}
function proceedGameLoopCharId(state, id) {
  var attrs = state.characterAttrsMap[id];
  var ctrl = state.characterCtrlMap[id];
  if (attrs && ctrl) {
    if (ctrl.left) {
      attrs.x -= characterSpeed;
    }
    if (ctrl.up) {
      attrs.y -= characterSpeed;
    }
    if (ctrl.down) {
      attrs.y += characterSpeed;
    }
    if (ctrl.right) {
      attrs.x += characterSpeed;
    }
    if (ctrl.fire) ;
  }
}
function addShooter(state, x, y) {
  var id = 1;
  while (state.characterAttrsMap[id]) id++;
  state.characterAttrsMap[id] = {
    id: id,
    hp: 100,
    x: x,
    y: y
  };
  state.characterCtrlMap[id] = Object.assign({}, defaultCharacterControl, {
    id: id
  });
}
function encodeAllShooters(state) {
  var attrsArr = Object.values(state.characterAttrsMap);
  var data = encodeAttrsArray(attrsArr);
  return data;
}

var int32 = new Int32Array(2);
new Float32Array(int32.buffer);
new Float64Array(int32.buffer);
new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;

var Encoding;
(function (Encoding) {
  Encoding[Encoding["UTF8_BYTES"] = 1] = "UTF8_BYTES";
  Encoding[Encoding["UTF16_STRING"] = 2] = "UTF16_STRING";
})(Encoding || (Encoding = {}));

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

function matchInit(ctx, logger, nk, params) {
  logger.debug('PixelShooter match created');
  var presences = {};
  var game = {
    characterAttrsMap: {},
    characterCtrlMap: {}
  };
  return {
    state: {
      presences: presences,
      game: game
    },
    tickRate: 20,
    label: 'PixelShooter'
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
  var data = encodeAllShooters(state.game);
  dispatcher.broadcastMessage(0, data, presences);
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
function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
  var ctrls = [];
  messages.forEach(function (m) {
    if (m.opCode === 0) {
      var attrs = decodeAttrsArray(m.data)[0];
      logger.info('Received new shooter %v', attrs);
      addShooter(state.game, attrs.x, attrs.y);
    } else if (m.opCode === 1) {
      var ctrl = decodeControls(m.data)[0];
      logger.info('Received control %v', ctrl);
      ctrls.push(ctrl);
    }
  });
  var updatedCtrls = proceedControls(state.game, ctrls);
  proceedGameLoop(state.game);
  if (updatedCtrls.length) {
    var data = encodeControls(updatedCtrls);
    dispatcher.broadcastMessage(1, data);
  }
  if (tick % 40 === 0) {
    var data = encodeAllShooters(state.game);
    if (data.byteLength > 1) dispatcher.broadcastMessage(0, data);
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
  logger.debug('PixelShooter match signal received: ' + data);
  return {
    state: state,
    data: "PixelShooter match signal received: " + data
  };
}
var pixelShooterMatchHandlers = {
  matchInit: matchInit,
  matchJoinAttempt: matchJoinAttempt,
  matchJoin: matchJoin,
  matchLeave: matchLeave,
  matchLoop: matchLoop,
  matchSignal: matchSignal,
  matchTerminate: matchTerminate
};
!TextEncoder && TextEncoder.bind(null);
!TextDecoder && TextDecoder.bind(null);

function InitModule(ctx, logger, nk, initializer) {
  logger.info('Hello World!');
  initializer.registerMatch('pixel_shooter_match', pixelShooterMatchHandlers);
  nk.matchCreate('pixel_shooter_match');
}
!InitModule && InitModule.bind(null);
