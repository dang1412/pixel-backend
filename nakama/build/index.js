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

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

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
function encodeCharacterTypes(types) {
  var buffer = new ArrayBuffer(2 * types.length + 1);
  var view = new DataView(buffer);
  view.setUint8(0, 2);
  for (var i = 0; i < types.length; i++) {
    var type = types[i];
    view.setUint8(2 * i + 1, type[0]);
    view.setUint8(2 * i + 2, type[1]);
  }
  return buffer;
}

var TICK_RATE = 6;
var GAME_LOOP_TIME = 1 / TICK_RATE;
var SHOOTER_SPEED = 3;

function getPixelIndex(x, y, w) {
  return y * w + x;
}
function getPixelXYFromIndex(index, w) {
  var x = index % w;
  var y = (index - x) / w;
  return [x, y];
}

function getPixelsFromArea(area, mapWidth) {
  var indexes = [];
  for (var j = 0; j < area.h; j++) {
    var index = getPixelIndex(area.x, area.y + j, mapWidth);
    for (var i = 0; i < area.w; i++) {
      indexes.push(index + i);
    }
  }
  return indexes;
}

var WORLD_WIDTH = 100;
var WORLD_HEIGHT = 100;

function getShooterArea(shooter) {
  return {
    x: (shooter.x - 50) / 100,
    y: (shooter.y - 50) / 100,
    w: 1,
    h: 1
  };
}
function shooterOnPixels(shooter) {
  var shooterArea = getShooterArea(shooter);
  var pixelArea = getPixelAreaFromObjectArea(shooterArea);
  return getPixelsFromArea(pixelArea, WORLD_WIDTH);
}
function getPixelAreaFromObjectArea(objArea) {
  var x = objArea.x,
    y = objArea.y,
    w = objArea.w,
    h = objArea.h;
  var x1 = Math.floor(x);
  var y1 = Math.floor(y);
  var x2 = Math.ceil(x + w) - 1;
  var y2 = Math.ceil(y + h) - 1;
  return {
    x: x1,
    y: y1,
    w: x2 - x1 + 1,
    h: y2 - y1 + 1
  };
}
function findUniqueElements(arr1, arr2) {
  var set1 = new Set(arr1);
  var set2 = new Set(arr2);
  var uniqueToSet1 = arr1.filter(function (a) {
    return !set2.has(a);
  });
  var uniqueToSet2 = arr2.filter(function (a) {
    return !set1.has(a);
  });
  return [uniqueToSet1, uniqueToSet2];
}
function isCollide(o1, o2) {
  if (o1.x > o2.x + o2.w || o2.x > o1.x + o1.w) return false;
  if (o1.y > o2.y + o2.h || o2.y > o1.y + o1.h) return false;
  return true;
}
function canMove(state, id, x, y) {
  if (x < 0 || x > WORLD_WIDTH * 100 || y < 0 || y > WORLD_HEIGHT * 100) return false;
  var movePixels = shooterOnPixels({
    id: id,
    hp: 0,
    x: x,
    y: y
  });
  for (var _i = 0, movePixels_1 = movePixels; _i < movePixels_1.length; _i++) {
    var pixel = movePixels_1[_i];
    if (state.buildingBlocks[pixel]) return false;
  }
  var shooterArea = getShooterArea({
    id: id,
    hp: 0,
    x: x,
    y: y
  });
  var potentialCollideIds = movePixels.map(function (pixel) {
    return state.positionCharactersMap[pixel] || [];
  }).flat();
  for (var _a = 0, potentialCollideIds_1 = potentialCollideIds; _a < potentialCollideIds_1.length; _a++) {
    var potentialId = potentialCollideIds_1[_a];
    if (potentialId !== id) {
      var checkArea = getShooterArea(state.characterAttrsMap[potentialId]);
      if (isCollide(shooterArea, checkArea)) return false;
    }
  }
  return true;
}
function setMove(attrs, x, y, positionCharactersMap) {
  var beforeMovePixels = shooterOnPixels(attrs);
  var afterMovePixels = shooterOnPixels({
    x: x,
    y: y,
    hp: 0,
    id: 0
  });
  var _a = findUniqueElements(beforeMovePixels, afterMovePixels),
    oldPixels = _a[0],
    newPixels = _a[1];
  attrs.x = x;
  attrs.y = y;
  removeFromPixels(positionCharactersMap, attrs.id, oldPixels);
  addToPixels(positionCharactersMap, attrs.id, newPixels);
}
function removeFromPixels(positionCharactersMap, id, pixels) {
  for (var _i = 0, pixels_1 = pixels; _i < pixels_1.length; _i++) {
    var pixel = pixels_1[_i];
    if (positionCharactersMap[pixel]) {
      positionCharactersMap[pixel] = positionCharactersMap[pixel].filter(function (_id) {
        return _id !== id;
      });
      if (positionCharactersMap[pixel].length === 0) {
        delete positionCharactersMap[pixel];
      }
    }
  }
}
function addToPixels(positionCharactersMap, id, pixels) {
  for (var _i = 0, pixels_2 = pixels; _i < pixels_2.length; _i++) {
    var pixel = pixels_2[_i];
    if (!positionCharactersMap[pixel]) positionCharactersMap[pixel] = [id];else positionCharactersMap[pixel].push(id);
  }
}

function proceedMoveTarget(state) {
  var movedIds = [];
  var ids = Object.keys(state.characterTarget);
  for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
    var idstr = ids_1[_i];
    var id = Number(idstr);
    var attrs = state.characterAttrsMap[id];
    var _a = state.characterTarget[id],
      tx = _a[0],
      ty = _a[1];
    var distance = SHOOTER_SPEED * GAME_LOOP_TIME * 100;
    var x = attrs.x,
      y = attrs.y;
    var _b = calculateMoveToTarget(x, y, tx, ty, distance),
      nx = _b[0],
      ny = _b[1];
    if (nx === tx && ny === ty) {
      delete state.characterTarget[id];
    }
    if (canMove(state, id, nx, ny)) {
      setMove(attrs, nx, ny, state.positionCharactersMap);
      movedIds.push(id);
    } else {
      delete state.characterTarget[id];
    }
  }
  return movedIds;
}
function calDistance(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
function calculateMoveToTarget(x, y, tx, ty, distance) {
  var d1 = calDistance(x, y, tx, ty);
  if (d1 <= distance) {
    return [tx, ty];
  }
  var angle = Math.atan2(ty - y, tx - x);
  var dy = Math.sin(angle) * distance;
  var dx = Math.cos(angle) * distance;
  return [x + dx, y + dy];
}

function angleEqual(angle, i) {
  return Math.round(angle * 100) === Math.round(i * Math.PI * 100);
}
function distanceToVerticalX(x, y, angle, x1) {
  var y1 = y + Math.tan(angle) * (x1 - x);
  return Math.abs(x1 - x) + Math.abs(y1 - y);
}
function distanceToHorizontalY(x, y, angle, y1) {
  var x1 = x + (y1 - y) / Math.tan(angle);
  return Math.abs(x1 - x) + Math.abs(y1 - y);
}
function proceedShootLinePixels(x, y, angle, proceedPixel) {
  var dirx = angleEqual(angle, 0.5) || angleEqual(angle, -0.5) ? 0 : angle > -Math.PI / 2 && angle < Math.PI / 2 ? 1 : -1;
  var diry = angleEqual(angle, 0) || angleEqual(angle, 1) || angleEqual(angle, -1) ? 0 : angle > 0 ? 1 : -1;
  var px = Math.floor(x);
  var py = Math.floor(y);
  var vx = dirx <= 0 ? px : px + 1;
  var hy = diry <= 0 ? py : py + 1;
  var dvx = dirx !== 0 ? distanceToVerticalX(x, y, angle, vx) : Infinity;
  var dhy = diry !== 0 ? distanceToHorizontalY(x, y, angle, hy) : Infinity;
  while (vx >= 0 && vx <= WORLD_WIDTH && hy >= 0 && hy <= WORLD_HEIGHT) {
    var iscontinue = proceedPixel(px, py);
    if (!iscontinue) break;
    if (dvx <= dhy) {
      px += dirx;
      vx += dirx;
      dvx = distanceToVerticalX(x, y, angle, vx);
    } else {
      py += diry;
      hy += diry;
      dhy = distanceToHorizontalY(x, y, angle, hy);
    }
  }
}
function findBoundaryIntersectPoint(x, y, angle) {
  if (angleEqual(angle, 0)) {
    return [WORLD_WIDTH, y];
  }
  if (angleEqual(angle, 1) || angleEqual(angle, -1)) {
    return [0, y];
  }
  if (angleEqual(angle, -0.5)) {
    return [x, 0];
  }
  if (angleEqual(angle, 0.5)) {
    return [x, WORLD_HEIGHT];
  }
  var boundaryHorizonY = angle > 0 ? WORLD_HEIGHT : 0;
  var boundaryHorizonX = (boundaryHorizonY - y) / Math.tan(angle) + x;
  if (boundaryHorizonX >= 0 && boundaryHorizonX <= WORLD_WIDTH) return [boundaryHorizonX, boundaryHorizonY];
  var boundaryVerticalX = angle > -Math.PI / 2 && angle < Math.PI / 2 ? WORLD_WIDTH : 0;
  var boundaryVerticalY = (boundaryVerticalX - x) * Math.tan(angle) + y;
  return [boundaryVerticalX, boundaryVerticalY];
}
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  var denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denominator === 0) {
    return null;
  }
  var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return null;
  }
  var x = x1 + ua * (x2 - x1);
  var y = y1 + ua * (y2 - y1);
  return [x, y];
}
function shootHitObject(x, y, bx, by, obj) {
  var ox1 = obj[0],
    oy1 = obj[1],
    w = obj[2],
    h = obj[3];
  var _a = [ox1 + w, oy1 + h],
    ox2 = _a[0],
    oy2 = _a[1];
  if (x >= ox1 && x <= ox2 && y >= oy1 && y <= oy2) return null;
  var segments = [[ox1, oy1, ox2, oy1], [ox2, oy1, ox2, oy2], [ox2, oy2, ox1, oy2], [ox1, oy2, ox1, oy1]];
  var hitPoint = null;
  for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
    var seg = segments_1[_i];
    var intersectP = intersect(x, y, bx, by, seg[0], seg[1], seg[2], seg[3]);
    if (intersectP) {
      var distance = Math.abs(intersectP[0] - x) + Math.abs(intersectP[1] - y);
      if (!hitPoint || hitPoint[2] > distance) {
        hitPoint = [intersectP[0], intersectP[1], distance];
      }
    }
  }
  return hitPoint;
}
function shootFirstHitObject(state, id, angle) {
  var attrs = state.characterAttrsMap[id];
  if (!attrs) return null;
  var _a = [attrs.x / 100, attrs.y / 100],
    x = _a[0],
    y = _a[1];
  var _b = findBoundaryIntersectPoint(x, y, angle),
    bx = _b[0],
    by = _b[1];
  var firstHit = [0, bx, by];
  var distance = Infinity;
  proceedShootLinePixels(x, y, angle, function (px, py) {
    var pixel = getPixelIndex(px, py, WORLD_WIDTH);
    var shooterIds = state.positionCharactersMap[pixel] || [];
    var objs = state.buildingBlocks[pixel] ? [[0, px, py, 1, 1]] : shooterIds.map(function (_id) {
      return _id !== id && state.characterAttrsMap[_id] ? [_id, (state.characterAttrsMap[_id].x - 50) / 100, (state.characterAttrsMap[_id].y - 50) / 100, 1, 1] : null;
    });
    for (var _i = 0, objs_1 = objs; _i < objs_1.length; _i++) {
      var obj = objs_1[_i];
      if (obj) {
        var hitP = shootHitObject(x, y, bx, by, obj.slice(1));
        if (hitP && distance > hitP[2]) {
          firstHit = [obj[0], hitP[0], hitP[1]];
          distance = hitP[2];
          return false;
        }
      }
    }
    return true;
  });
  return firstHit;
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
var CharType;
(function (CharType) {
  CharType[CharType["man"] = 0] = "man";
  CharType[CharType["woman"] = 1] = "woman";
  CharType[CharType["zombie1"] = 2] = "zombie1";
  CharType[CharType["zombie2"] = 3] = "zombie2";
  CharType[CharType["zombie3"] = 4] = "zombie3";
  CharType[CharType["zombie4"] = 5] = "zombie4";
})(CharType || (CharType = {}));

function cleanupDeadChars(state) {
  var ids = Object.keys(state.characterAttrsMap);
  for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
    var idstr = ids_1[_i];
    var id = Number(idstr);
    var attrs = state.characterAttrsMap[id];
    if (attrs && attrs.hp <= 0) {
      delete state.characterAttrsMap[id];
      delete state.characterCtrlMap[id];
      removeShooter(attrs, state.positionCharactersMap);
    }
  }
}
function proceedControls(state, ctrls, speed, logger) {
  var idCtrlMap = {};
  var zombieCtrls = generateZombieCtrls(state);
  ctrls = ctrls.concat(zombieCtrls);
  for (var _i = 0, ctrls_1 = ctrls; _i < ctrls_1.length; _i++) {
    var ctrl = ctrls_1[_i];
    var id = ctrl.id;
    if (idCtrlMap[id]) {
      ctrl.fire = idCtrlMap[id].fire || ctrl.fire;
    }
    idCtrlMap[id] = ctrl;
  }
  var idSet = new Set();
  var updatedCtrls = Object.values(idCtrlMap);
  for (var _a = 0, updatedCtrls_1 = updatedCtrls; _a < updatedCtrls_1.length; _a++) {
    var ctrl = updatedCtrls_1[_a];
    if (ctrl.fire) {
      if (ctrl.weapon === 2 || ctrl.weapon === 3) {
        var attrs = state.characterAttrsMap[ctrl.id];
        var angle = ctrl.angle / 100 - 1.5 * Math.PI;
        var hitP = attrs ? shootFirstHitObject(state, attrs.id, angle) : null;
        if (hitP) {
          if (logger) {
            logger.info("Hit %v", hitP);
          }
          var targetAttrs = state.characterAttrsMap[hitP[0]];
          if (targetAttrs) {
            targetAttrs.hp -= 5;
            idSet.add(targetAttrs.id);
            if (targetAttrs.hp <= 0) ;
          }
        }
      }
    }
  }
  for (var _b = 0, ctrls_2 = ctrls; _b < ctrls_2.length; _b++) {
    var ctrl = ctrls_2[_b];
    var id = ctrl.id;
    var moved = proceedMoveByCtrl(state, id, ctrl);
    if (moved) {
      idSet.add(id);
      state.characterCtrlMap[id] = ctrl;
      delete state.characterTarget[id];
    }
  }
  var movedIds = proceedMoveTarget(state);
  for (var _c = 0, movedIds_1 = movedIds; _c < movedIds_1.length; _c++) {
    var movedId = movedIds_1[_c];
    idSet.add(movedId);
  }
  return [updatedCtrls, Array.from(idSet)];
}
function removeShooter(attrs, positionCharactersMap) {
  var pixels = shooterOnPixels(attrs);
  removeFromPixels(positionCharactersMap, attrs.id, pixels);
}
function proceedMoveByCtrl(state, id, ctrl) {
  var attrs = state.characterAttrsMap[id];
  if (!attrs) return false;
  if (ctrl.left && ctrl.right) {
    ctrl.left = ctrl.right = false;
  }
  if (ctrl.up && ctrl.down) {
    ctrl.up = ctrl.down = false;
  }
  var goDiagonal = ctrl.left && (ctrl.up || ctrl.down) || ctrl.right && (ctrl.up || ctrl.down);
  var speed = SHOOTER_SPEED * GAME_LOOP_TIME * 100 / (goDiagonal ? Math.sqrt(2) : 1);
  var isMove = false;
  var _a = [attrs.x, attrs.y],
    x = _a[0],
    y = _a[1];
  if (ctrl.left) {
    if (proceedMove(state, attrs, x - speed, y)) {
      x -= speed;
      isMove = true;
    }
  }
  if (ctrl.up) {
    if (proceedMove(state, attrs, x, y - speed)) {
      y -= speed;
      isMove = true;
    }
  }
  if (ctrl.down) {
    if (proceedMove(state, attrs, x, y + speed)) {
      y += speed;
      isMove = true;
    }
  }
  if (ctrl.right) {
    if (proceedMove(state, attrs, x + speed, y)) {
      x += speed;
      isMove = true;
    }
  }
  return isMove;
}
function proceedMove(state, attrs, x, y) {
  if (!canMove(state, attrs.id, x, y)) {
    return false;
  }
  setMove(attrs, x, y, state.positionCharactersMap);
  return true;
}
function addShooter(state, x, y, type) {
  if (type === void 0) {
    type = CharType.man;
  }
  var id = 1;
  while (state.characterAttrsMap[id]) id++;
  var attrs = {
    id: id,
    hp: 100,
    x: x,
    y: y
  };
  state.characterAttrsMap[id] = attrs;
  state.characterCtrlMap[id] = Object.assign({}, defaultCharacterControl, {
    id: id
  });
  state.characterTypes[id] = type;
  var newPixels = shooterOnPixels(attrs);
  addToPixels(state.positionCharactersMap, attrs.id, newPixels);
  return attrs;
}
function encodeAllShooters(state, ids) {
  var attrsArr = ids ? getAttrsArr(state, ids) : Object.values(state.characterAttrsMap);
  var data = encodeAttrsArray(attrsArr);
  return data;
}
function getAttrsArr(state, ids) {
  var attrsArr = ids.map(function (id) {
    return state.characterAttrsMap[id];
  }).filter(function (attrs) {
    return attrs;
  });
  return attrsArr;
}
function encodeShooterTypes(state, ids) {
  ids = ids || Object.keys(state.characterAttrsMap).map(function (i) {
    return Number(i);
  });
  var types = ids.map(function (id) {
    return [id, state.characterTypes[id]];
  });
  var data = encodeCharacterTypes(types);
  return data;
}
function generateZombieCtrls(state) {
  var ctrls = [];
  var ids = Object.keys(state.characterAttrsMap).map(function (i) {
    return Number(i);
  });
  for (var _i = 0, ids_2 = ids; _i < ids_2.length; _i++) {
    var id = ids_2[_i];
    if (state.characterTypes[id] > 1) {
      var ctrl = Object.assign({}, defaultCharacterControl);
      ctrl.id = id;
      var act = Math.floor(Math.random() * 20);
      switch (act) {
        case 0:
          ctrl.up = true;
          ctrl.angle = Math.PI * 100;
          break;
        case 1:
          ctrl.down = true;
          ctrl.angle = 0;
          break;
        case 2:
          ctrl.left = true;
          ctrl.angle = Math.PI * 50;
          break;
        case 3:
          ctrl.right = true;
          ctrl.angle = Math.PI * 150;
          break;
        case 4:
          ctrl.fire = true;
          ctrl.angle = state.characterCtrlMap[id].angle;
          break;
        default:
          Object.assign(ctrl, state.characterCtrlMap[id]);
          ctrl.fire = false;
          break;
      }
      ctrls.push(ctrl);
    }
  }
  return ctrls;
}

var areas = [{
  x: 41,
  y: 33,
  w: 2,
  h: 2
}, {
  x: 37,
  y: 42,
  w: 5,
  h: 3
}, {
  x: 56,
  y: 34,
  w: 8,
  h: 3
}, {
  x: 48,
  y: 48,
  w: 3,
  h: 3
}, {
  x: 37,
  y: 53,
  w: 4,
  h: 4
}, {
  x: 60,
  y: 48,
  w: 6,
  h: 4
}, {
  x: 49,
  y: 39,
  w: 6,
  h: 3
}, {
  x: 50,
  y: 60,
  w: 5,
  h: 3
}];
function initGameState() {
  var buildingBlocks = {};
  for (var _i = 0, areas_1 = areas; _i < areas_1.length; _i++) {
    var area = areas_1[_i];
    var pixels = getPixelsFromArea(area, WORLD_WIDTH);
    for (var _a = 0, pixels_1 = pixels; _a < pixels_1.length; _a++) {
      var pixel = pixels_1[_a];
      buildingBlocks[pixel] = true;
    }
  }
  return {
    characterAttrsMap: {},
    characterCtrlMap: {},
    characterTarget: {},
    characterTypes: {},
    positionCharactersMap: {},
    buildingBlocks: buildingBlocks
  };
}

function matchInit$1(ctx, logger, nk, params) {
  logger.debug('PixelShooter match created');
  var presences = {};
  var game = initGameState();
  return {
    state: {
      presences: presences,
      game: game
    },
    tickRate: TICK_RATE,
    label: 'PixelShooter'
  };
}
function matchJoinAttempt$1(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
  logger.debug('%q attempted to join Shooter match', ctx.userId);
  return {
    state: state,
    accept: true
  };
}
function matchJoin$1(ctx, logger, nk, dispatcher, tick, state, presences) {
  presences.forEach(function (presence) {
    state.presences[presence.userId] = presence;
    logger.info('%q joined Shooter match', presence.userId);
  });
  var typesData = encodeShooterTypes(state.game);
  dispatcher.broadcastMessage(2, typesData, presences);
  var data = encodeAllShooters(state.game);
  dispatcher.broadcastMessage(0, data, presences);
  return {
    state: state
  };
}
function matchLeave$1(ctx, logger, nk, dispatcher, tick, state, presences) {
  presences.forEach(function (presence) {
    delete state.presences[presence.userId];
    logger.info('%q left Shooter match', presence.userId);
  });
  return {
    state: state
  };
}
function matchLoop$1(ctx, logger, nk, dispatcher, tick, state, messages) {
  var ctrls = [];
  var newIds = [];
  messages.forEach(function (m) {
    if (m.opCode === 0) {
      var decoded = decodeAttrsArray(m.data)[0];
      logger.info('Received new shooter %v', decoded);
      var attrs = addShooter(state.game, decoded.x, decoded.y, decoded.id);
      newIds.push(attrs.id);
    } else if (m.opCode === 1) {
      var ctrl = decodeControls(m.data)[0];
      logger.info('Received control %v', ctrl);
      ctrls.push(ctrl);
    } else if (m.opCode === 2) {
      var decoded = decodeAttrsArray(m.data)[0];
      logger.info('Set move target %v', decoded);
      state.game.characterTarget[decoded.id] = [decoded.x, decoded.y];
    }
  });
  cleanupDeadChars(state.game);
  var _a = proceedControls(state.game, ctrls, 25, logger),
    updatedCtrls = _a[0],
    movedIds = _a[1];
  var updatedIds = __spreadArray(__spreadArray([], movedIds, true), newIds, true);
  if (newIds.length) {
    logger.info('New chars %v', newIds);
    var data = encodeShooterTypes(state.game, newIds);
    dispatcher.broadcastMessage(2, data);
  }
  if (updatedCtrls.length) {
    logger.info('updatedCtrls %v', updatedCtrls);
    var data = encodeControls(updatedCtrls);
    dispatcher.broadcastMessage(1, data);
  }
  if (updatedIds.length) {
    logger.info('updatedIds %v', updatedIds);
    var data = encodeAllShooters(state.game, updatedIds);
    dispatcher.broadcastMessage(0, data);
  }
  return {
    state: state
  };
}
function matchTerminate$1(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
  logger.debug('Shooter match terminated');
  var message = "Server shutting down in ".concat(graceSeconds, " seconds.");
  dispatcher.broadcastMessage(2, message, null, null);
  return {
    state: state
  };
}
function matchSignal$1(ctx, logger, nk, dispatcher, tick, state, data) {
  logger.debug('PixelShooter match signal received: ' + data);
  return {
    state: state,
    data: "PixelShooter match signal received: " + data
  };
}
var pixelShooterMatchHandlers = {
  matchInit: matchInit$1,
  matchJoinAttempt: matchJoinAttempt$1,
  matchJoin: matchJoin$1,
  matchLeave: matchLeave$1,
  matchLoop: matchLoop$1,
  matchSignal: matchSignal$1,
  matchTerminate: matchTerminate$1
};

var BeastActionType;
(function (BeastActionType) {
  BeastActionType[BeastActionType["move"] = 0] = "move";
  BeastActionType[BeastActionType["shoot"] = 1] = "shoot";
})(BeastActionType || (BeastActionType = {}));
var defaultBeastAttrs = {
  hp: 3,
  maxHp: 3,
  moveRange: 4,
  shootRange: 4,
  w: 1,
  h: 1
};

var AdventureEngine = function () {
  function AdventureEngine() {}
  AdventureEngine.initState = function () {
    var state = {
      beastAttrsMap: {},
      beastTypeAttrsMap: {},
      beastPixelMap: {},
      pixelBeastMap: {},
      beastOnMap: [],
      weaponAttrsMap: {},
      pixelItemMap: {},
      pixelWeaponsMap: {},
      beastEquipWeaponsMap: {},
      beastEquipItemMap: {}
    };
    state.weaponAttrsMap[1] = {
      damage: 1,
      damageArea: {
        x: -1,
        y: 0,
        w: 3,
        h: 3
      }
    };
    state.weaponAttrsMap[2] = {
      damage: 1,
      damageArea: {
        x: -1,
        y: -1,
        w: 3,
        h: 3
      }
    };
    state.beastTypeAttrsMap = {
      7: {
        maxHp: 10
      },
      8: {
        w: 3,
        h: 3,
        maxHp: 10
      }
    };
    return state;
  };
  AdventureEngine.getAllBeastPositions = function (state) {
    var positions = Object.keys(state.beastPixelMap).map(function (id) {
      return Number(id);
    }).map(function (id) {
      return {
        beastId: id,
        pixel: state.beastPixelMap[id]
      };
    });
    return positions;
  };
  AdventureEngine.getAllBeastProps = function (state) {
    var beastIds = Object.keys(state.beastAttrsMap).map(function (id) {
      return Number(id);
    });
    var hps = beastIds.map(function (id) {
      return state.beastAttrsMap[id].hp || 3;
    });
    var items = beastIds.map(function (id) {
      return state.beastEquipItemMap[id] || 0;
    });
    return [beastIds, hps, items];
  };
  AdventureEngine.getAllPixelItems = function (state) {
    var pixels = Object.keys(state.pixelItemMap).map(function (id) {
      return Number(id);
    });
    var items = pixels.map(function (pixel) {
      return state.pixelItemMap[pixel] || 0;
    });
    return [pixels, items];
  };
  AdventureEngine.onboardBeast = function (state, beastId, pixel, weapons, attrs) {
    var type = Math.floor(beastId / 1000000);
    var beastAttrs = Object.assign({}, defaultBeastAttrs, state.beastTypeAttrsMap[type] || {}, attrs || {});
    state.beastAttrsMap[beastId] = beastAttrs;
    var moved = AdventureEngine.executeMove(state, {
      beastId: beastId,
      pixel: pixel
    });
    if (moved) state.beastEquipWeaponsMap[beastId] = weapons;
    return moved;
  };
  AdventureEngine.dropItemOnMap = function (state, itemId, pixel) {
    var currentItem = state.pixelItemMap[pixel];
    if (currentItem >= 0) {
      return false;
    }
    state.pixelItemMap[pixel] = itemId;
    return true;
  };
  AdventureEngine.proceedDropItem = function (state, dropItems, updates) {
    for (var _i = 0, dropItems_1 = dropItems; _i < dropItems_1.length; _i++) {
      var action = dropItems_1[_i];
      var itemId = action.beastId,
        pixel = action.pixel;
      var isDropped = AdventureEngine.dropItemOnMap(state, itemId, pixel);
      if (isDropped) {
        updates.changedPixels.push(pixel);
        updates.changedPixelItems.push(itemId);
      }
    }
  };
  AdventureEngine.proceedActions = function (state, moves, shoots, dropEquipBeasts) {
    var updates = {
      moves: [],
      shoots: [],
      changedBeasts: [],
      changedBeastHps: [],
      changedBeastEquips: [],
      changedPixels: [],
      changedPixelItems: []
    };
    var changedBeastSet = new Set();
    var changedPixelSet = new Set();
    for (var _i = 0, dropEquipBeasts_1 = dropEquipBeasts; _i < dropEquipBeasts_1.length; _i++) {
      var beastId = dropEquipBeasts_1[_i];
      var item = state.beastEquipItemMap[beastId];
      if (!item) continue;
      var pixel = state.beastPixelMap[beastId];
      if (pixel === undefined) continue;
      var isDropped = AdventureEngine.dropItemOnMap(state, item, pixel);
      if (isDropped) {
        delete state.beastEquipItemMap[beastId];
        changedBeastSet.add(beastId);
        changedPixelSet.add(pixel);
      }
    }
    for (var _a = 0, moves_1 = moves; _a < moves_1.length; _a++) {
      var move = moves_1[_a];
      var beastId = move.beastId,
        pixel = move.pixel;
      var curpos = state.beastPixelMap[beastId];
      if (curpos >= 0) {
        var moved = AdventureEngine.executeMove(state, move);
        if (moved) updates.moves.push(move);
      }
    }
    for (var _b = 0, shoots_1 = shoots; _b < shoots_1.length; _b++) {
      var shoot = shoots_1[_b];
      var beastId = shoot.beastId,
        pixel = shoot.pixel;
      var curpos = state.beastPixelMap[beastId];
      if (curpos >= 0) {
        AdventureEngine.executeShoot(state, shoot, changedBeastSet);
        updates.shoots.push(shoot);
      }
    }
    for (var _c = 0, _d = updates.moves; _c < _d.length; _c++) {
      var move = _d[_c];
      var beastId = AdventureEngine.tryEquips(state, move.pixel);
      if (beastId >= 0) {
        changedBeastSet.add(beastId);
        changedPixelSet.add(move.pixel);
      }
    }
    updates.changedBeasts = Array.from(changedBeastSet);
    updates.changedBeastHps = updates.changedBeasts.map(function (beastId) {
      return state.beastAttrsMap[beastId].hp;
    });
    updates.changedBeastEquips = updates.changedBeasts.map(function (beastId) {
      return state.beastEquipItemMap[beastId] || 0;
    });
    updates.changedPixels = Array.from(changedPixelSet);
    updates.changedPixelItems = updates.changedPixels.map(function (pixel) {
      return state.pixelItemMap[pixel] || 0;
    });
    return updates;
  };
  AdventureEngine.tryEquips = function (state, pixel) {
    var beastId = state.pixelBeastMap[pixel];
    if (beastId === undefined) {
      return -1;
    }
    var item = state.pixelItemMap[pixel];
    if (item === undefined) {
      return -1;
    }
    var equippedItem = state.beastEquipItemMap[beastId];
    if (equippedItem >= 0) {
      return -1;
    }
    delete state.pixelItemMap[pixel];
    state.beastEquipItemMap[beastId] = item;
    return beastId;
  };
  AdventureEngine.executeMove = function (state, _a) {
    var beastId = _a.beastId,
      pixel = _a.pixel;
    var attr = state.beastAttrsMap[beastId];
    var _b = getPixelXYFromIndex(pixel, WORLD_WIDTH),
      x = _b[0],
      y = _b[1];
    var pixels = getPixelsFromArea({
      x: x,
      y: y,
      w: attr.w,
      h: attr.h
    }, WORLD_WIDTH);
    for (var _i = 0, pixels_1 = pixels; _i < pixels_1.length; _i++) {
      var p = pixels_1[_i];
      if (state.pixelBeastMap[p] && state.pixelBeastMap[p] !== beastId) {
        return false;
      }
    }
    var from = state.beastPixelMap[beastId];
    if (from >= 0) {
      var _c = getPixelXYFromIndex(from, WORLD_WIDTH),
        fx = _c[0],
        fy = _c[1];
      var fromPixels = getPixelsFromArea({
        x: fx,
        y: fy,
        w: attr.w,
        h: attr.h
      }, WORLD_WIDTH);
      for (var _d = 0, fromPixels_1 = fromPixels; _d < fromPixels_1.length; _d++) {
        var fp = fromPixels_1[_d];
        delete state.pixelBeastMap[fp];
      }
    }
    state.beastPixelMap[beastId] = pixels[0];
    for (var _e = 0, pixels_2 = pixels; _e < pixels_2.length; _e++) {
      var p = pixels_2[_e];
      state.pixelBeastMap[p] = beastId;
    }
    return true;
  };
  AdventureEngine.executeShoot = function (state, shoot, changedBeasts) {
    shoot.beastId;
      var pixel = shoot.pixel,
      type = shoot.type;
    var _a = state.weaponAttrsMap[type] || {
        damage: 1,
        damageArea: {
          x: 0,
          y: 0,
          w: 1,
          h: 1
        }
      },
      damage = _a.damage,
      damageArea = _a.damageArea;
    var _b = getPixelXYFromIndex(pixel, WORLD_WIDTH),
      tarx = _b[0],
      tary = _b[1];
    var _c = [tarx + damageArea.x, tary + damageArea.y, damageArea.w, damageArea.h],
      x = _c[0],
      y = _c[1],
      w = _c[2],
      h = _c[3];
    var damagedPixels = getPixelsFromArea({
      x: x,
      y: y,
      w: w,
      h: h
    }, WORLD_WIDTH);
    for (var _i = 0, damagedPixels_1 = damagedPixels; _i < damagedPixels_1.length; _i++) {
      var target = damagedPixels_1[_i];
      var update = AdventureEngine.receiveDamage(state, target, damage);
      if (update) {
        var beastId_1 = update[0],
          attrs = update[1];
        state.beastAttrsMap[beastId_1] = attrs;
        changedBeasts.add(beastId_1);
      }
    }
  };
  AdventureEngine.receiveDamage = function (state, pixel, damage) {
    var beastId = state.pixelBeastMap[pixel];
    if (beastId === undefined) {
      return undefined;
    }
    var attrs = state.beastAttrsMap[beastId];
    if (attrs === undefined) {
      return undefined;
    }
    if (attrs.hp === 0) {
      return undefined;
    }
    var hp = Math.max(attrs.hp - damage, 0);
    if (hp === 0) {
      AdventureEngine.beastDie(state, beastId);
    }
    return [beastId, {
      hp: hp
    }];
  };
  AdventureEngine.beastDie = function (state, beastId) {
    var attrs = state.beastAttrsMap[beastId];
    var pixel = state.beastPixelMap[beastId];
    var _a = getPixelXYFromIndex(pixel, WORLD_WIDTH),
      x = _a[0],
      y = _a[1];
    var pixels = getPixelsFromArea({
      x: x,
      y: y,
      w: attrs.w,
      h: attrs.h
    }, WORLD_WIDTH);
    for (var _i = 0, pixels_3 = pixels; _i < pixels_3.length; _i++) {
      var p = pixels_3[_i];
      delete state.pixelBeastMap[p];
    }
    delete state.beastPixelMap[beastId];
    delete state.beastAttrsMap[beastId];
  };
  return AdventureEngine;
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
  BeastAction.prototype.type = function () {
    return this.bb.readInt16(this.bb_pos + 8);
  };
  BeastAction.sizeOf = function () {
    return 12;
  };
  BeastAction.createBeastAction = function (builder, id, target, type) {
    builder.prep(4, 12);
    builder.pad(2);
    builder.writeInt16(type);
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
    return offset ? (obj || new BeastAction()).__init(this.bb.__vector(this.bb_pos + offset) + index * 12, this.bb) : null;
  };
  UpdateState.prototype.beastMovesLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.beastShoots = function (index, obj) {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? (obj || new BeastAction()).__init(this.bb.__vector(this.bb_pos + offset) + index * 12, this.bb) : null;
  };
  UpdateState.prototype.beastShootsLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.beastChange = function (index) {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readInt32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  };
  UpdateState.prototype.beastChangeLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.beastChangeArray = function () {
    var offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? new Int32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  };
  UpdateState.prototype.beastChangeHp = function (index) {
    var offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.readInt16(this.bb.__vector(this.bb_pos + offset) + index * 2) : 0;
  };
  UpdateState.prototype.beastChangeHpLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.beastChangeHpArray = function () {
    var offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? new Int16Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  };
  UpdateState.prototype.beastChangeEquips = function (index) {
    var offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? this.bb.readInt16(this.bb.__vector(this.bb_pos + offset) + index * 2) : 0;
  };
  UpdateState.prototype.beastChangeEquipsLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.beastChangeEquipsArray = function () {
    var offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? new Int16Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  };
  UpdateState.prototype.pixelChange = function (index) {
    var offset = this.bb.__offset(this.bb_pos, 14);
    return offset ? this.bb.readInt32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  };
  UpdateState.prototype.pixelChangeLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 14);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.pixelChangeArray = function () {
    var offset = this.bb.__offset(this.bb_pos, 14);
    return offset ? new Int32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  };
  UpdateState.prototype.pixelChangeItems = function (index) {
    var offset = this.bb.__offset(this.bb_pos, 16);
    return offset ? this.bb.readInt16(this.bb.__vector(this.bb_pos + offset) + index * 2) : 0;
  };
  UpdateState.prototype.pixelChangeItemsLength = function () {
    var offset = this.bb.__offset(this.bb_pos, 16);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  };
  UpdateState.prototype.pixelChangeItemsArray = function () {
    var offset = this.bb.__offset(this.bb_pos, 16);
    return offset ? new Int16Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  };
  UpdateState.startUpdateState = function (builder) {
    builder.startObject(7);
  };
  UpdateState.addBeastMoves = function (builder, beastMovesOffset) {
    builder.addFieldOffset(0, beastMovesOffset, 0);
  };
  UpdateState.startBeastMovesVector = function (builder, numElems) {
    builder.startVector(12, numElems, 4);
  };
  UpdateState.addBeastShoots = function (builder, beastShootsOffset) {
    builder.addFieldOffset(1, beastShootsOffset, 0);
  };
  UpdateState.startBeastShootsVector = function (builder, numElems) {
    builder.startVector(12, numElems, 4);
  };
  UpdateState.addBeastChange = function (builder, beastChangeOffset) {
    builder.addFieldOffset(2, beastChangeOffset, 0);
  };
  UpdateState.createBeastChangeVector = function (builder, data) {
    builder.startVector(4, data.length, 4);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addInt32(data[i]);
    }
    return builder.endVector();
  };
  UpdateState.startBeastChangeVector = function (builder, numElems) {
    builder.startVector(4, numElems, 4);
  };
  UpdateState.addBeastChangeHp = function (builder, beastChangeHpOffset) {
    builder.addFieldOffset(3, beastChangeHpOffset, 0);
  };
  UpdateState.createBeastChangeHpVector = function (builder, data) {
    builder.startVector(2, data.length, 2);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addInt16(data[i]);
    }
    return builder.endVector();
  };
  UpdateState.startBeastChangeHpVector = function (builder, numElems) {
    builder.startVector(2, numElems, 2);
  };
  UpdateState.addBeastChangeEquips = function (builder, beastChangeEquipsOffset) {
    builder.addFieldOffset(4, beastChangeEquipsOffset, 0);
  };
  UpdateState.createBeastChangeEquipsVector = function (builder, data) {
    builder.startVector(2, data.length, 2);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addInt16(data[i]);
    }
    return builder.endVector();
  };
  UpdateState.startBeastChangeEquipsVector = function (builder, numElems) {
    builder.startVector(2, numElems, 2);
  };
  UpdateState.addPixelChange = function (builder, pixelChangeOffset) {
    builder.addFieldOffset(5, pixelChangeOffset, 0);
  };
  UpdateState.createPixelChangeVector = function (builder, data) {
    builder.startVector(4, data.length, 4);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addInt32(data[i]);
    }
    return builder.endVector();
  };
  UpdateState.startPixelChangeVector = function (builder, numElems) {
    builder.startVector(4, numElems, 4);
  };
  UpdateState.addPixelChangeItems = function (builder, pixelChangeItemsOffset) {
    builder.addFieldOffset(6, pixelChangeItemsOffset, 0);
  };
  UpdateState.createPixelChangeItemsVector = function (builder, data) {
    builder.startVector(2, data.length, 2);
    for (var i = data.length - 1; i >= 0; i--) {
      builder.addInt16(data[i]);
    }
    return builder.endVector();
  };
  UpdateState.startPixelChangeItemsVector = function (builder, numElems) {
    builder.startVector(2, numElems, 2);
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
  UpdateState.createUpdateState = function (builder, beastMovesOffset, beastShootsOffset, beastChangeOffset, beastChangeHpOffset, beastChangeEquipsOffset, pixelChangeOffset, pixelChangeItemsOffset) {
    UpdateState.startUpdateState(builder);
    UpdateState.addBeastMoves(builder, beastMovesOffset);
    UpdateState.addBeastShoots(builder, beastShootsOffset);
    UpdateState.addBeastChange(builder, beastChangeOffset);
    UpdateState.addBeastChangeHp(builder, beastChangeHpOffset);
    UpdateState.addBeastChangeEquips(builder, beastChangeEquipsOffset);
    UpdateState.addPixelChange(builder, pixelChangeOffset);
    UpdateState.addPixelChangeItems(builder, pixelChangeItemsOffset);
    return UpdateState.endUpdateState(builder);
  };
  return UpdateState;
}();

function encodeMatchUpdate(updates) {
  var builder = new Builder(1024);
  var executedMoves = updates.moves,
    executedShoots = updates.shoots,
    changedBeastHps = updates.changedBeastHps,
    changedBeastIds = updates.changedBeasts,
    changedBeastEquips = updates.changedBeastEquips,
    changedPixels = updates.changedPixels,
    changedPixelItems = updates.changedPixelItems;
  UpdateState.startBeastMovesVector(builder, executedMoves.length);
  for (var _i = 0, executedMoves_1 = executedMoves; _i < executedMoves_1.length; _i++) {
    var move = executedMoves_1[_i];
    BeastAction.createBeastAction(builder, move.beastId, move.pixel, move.type);
  }
  var moves = builder.endVector();
  UpdateState.startBeastShootsVector(builder, executedShoots.length);
  for (var _a = 0, executedShoots_1 = executedShoots; _a < executedShoots_1.length; _a++) {
    var shoot = executedShoots_1[_a];
    BeastAction.createBeastAction(builder, shoot.beastId, shoot.pixel, shoot.type);
  }
  var shoots = builder.endVector();
  var changeIds = UpdateState.createBeastChangeVector(builder, changedBeastIds);
  var changeHps = UpdateState.createBeastChangeHpVector(builder, changedBeastHps);
  var changeEquips = UpdateState.createBeastChangeEquipsVector(builder, changedBeastEquips);
  var changePixels = UpdateState.createPixelChangeVector(builder, changedPixels);
  var changePixelItems = UpdateState.createPixelChangeItemsVector(builder, changedPixelItems);
  UpdateState.startUpdateState(builder);
  UpdateState.addBeastMoves(builder, moves);
  UpdateState.addBeastShoots(builder, shoots);
  UpdateState.addBeastChange(builder, changeIds);
  UpdateState.addBeastChangeHp(builder, changeHps);
  UpdateState.addBeastChangeEquips(builder, changeEquips);
  UpdateState.addPixelChange(builder, changePixels);
  UpdateState.addPixelChangeItems(builder, changePixelItems);
  var end = UpdateState.endUpdateState(builder);
  builder.finish(end);
  return builder.asUint8Array();
}

var TextEncoder$1 = function () {
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
var TextDecoder$1 = function () {
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
  logger.debug('Adventure match created');
  var presences = {};
  var adventure = AdventureEngine.initState();
  return {
    state: {
      presences: presences,
      adventure: adventure
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
  var positions = AdventureEngine.getAllBeastPositions(state.adventure);
  var props = AdventureEngine.getAllBeastProps(state.adventure);
  var _a = AdventureEngine.getAllPixelItems(state.adventure),
    pixels = _a[0],
    items = _a[1];
  var data = encodeMatchUpdate({
    moves: positions,
    shoots: [],
    changedBeasts: props[0],
    changedBeastHps: props[1],
    changedBeastEquips: props[2],
    changedPixels: pixels,
    changedPixelItems: items
  });
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
function decodeAction(data) {
  var buffer = data.buffer;
  var view = new DataView(buffer);
  var beastId = view.getInt32(0, true);
  var pixel = view.getInt32(4, true);
  return {
    beastId: beastId,
    pixel: pixel
  };
}
function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
  var _a;
  var moves = [];
  var shoots = [];
  var onboardMoves = [];
  var dropItems = [];
  var dropEquipBeasts = [];
  messages.forEach(function (message) {
    var beastAction = decodeAction(new Uint8Array(message.data));
    beastAction.type = state.adventure.beastEquipItemMap[beastAction.beastId] || 0;
    if (message.opCode === 0) {
      moves.push(beastAction);
    } else if (message.opCode === 1) {
      shoots.push(beastAction);
    } else if (message.opCode === 2) {
      logger.info('Onboard beast %v', beastAction);
      var onboarded = AdventureEngine.onboardBeast(state.adventure, beastAction.beastId, beastAction.pixel, []);
      if (onboarded) onboardMoves.push(beastAction);
    } else if (message.opCode === 99) {
      logger.info('Drop item %v', beastAction);
      dropItems.push(beastAction);
    } else if (message.opCode === 199) {
      logger.info('Beast Drop item %v', beastAction);
      dropEquipBeasts.push(beastAction.beastId);
    }
    logger.info('Received action %v', beastAction, message.opCode);
  });
  var updates = AdventureEngine.proceedActions(state.adventure, moves, shoots, dropEquipBeasts);
  (_a = updates.moves).push.apply(_a, onboardMoves);
  AdventureEngine.proceedDropItem(state.adventure, dropItems, updates);
  if (updates.moves.length || updates.shoots.length || updates.changedBeasts.length || updates.changedPixels.length) {
    var data = encodeMatchUpdate(updates);
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
!TextEncoder$1 && TextEncoder$1.bind(null);
!TextDecoder$1 && TextDecoder$1.bind(null);
var pixelAdventureMatchHandlers = {
  matchInit: matchInit,
  matchJoinAttempt: matchJoinAttempt,
  matchJoin: matchJoin,
  matchLeave: matchLeave,
  matchLoop: matchLoop,
  matchSignal: matchSignal,
  matchTerminate: matchTerminate
};

function InitModule(ctx, logger, nk, initializer) {
  logger.info('Hello World!');
  initializer.registerMatch('adventure_match', pixelAdventureMatchHandlers);
  nk.matchCreate('adventure_match');
  initializer.registerMatch('pixel_shooter_match', pixelShooterMatchHandlers);
  nk.matchCreate('pixel_shooter_match');
}
!InitModule && InitModule.bind(null);
