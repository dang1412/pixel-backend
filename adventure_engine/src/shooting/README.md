# Shooting Game Logic Module

## Data

```ts
export interface CharacterAttrs { // 6 bytes
  id: number // 1 byte
  hp: number // 1 byte
  x: number // 2 bytes
  y: number // 2 bytes
}

export interface CharacterControl { // 3 bytes
  up: boolean  // up 1bit
  down: boolean  // down 1bit
  left: boolean  // left 1bit
  right: boolean  // right 1bit
  fire: boolean  // fire 1bit
  weapon: number // weapon 3bit
  angle: number // angle 10bit (radian 0 -> 2PI)
  id: number  // 6bit
}

export interface ShootingGameState {
  characterAttrsMap: {[id: number]: CharacterAttrs}
  characterCtrlMap: {[id: number]: CharacterControl}
}
```

- Client send to server every `CharacterControl`

- Server
  - Game loop: currently **5 loop per second** (tickRate: 5)
  - In each loop
    - Gather all controls from client and process them in order to update game state `ShootingGameState`
    - Encode and send back updates to all clients `CharacterControl[]` and `CharacterAttrs[]`

## Real-time movement

Basically doing the following with the **being controlled character** after receiving control signal from keyboard

- Move locally based on control signal
- Send the control signal to server
- Get the position updated from server, store to temp value
- After not moving for a while, update the current position to the latest received server position (interpolate way)

In these steps it is important to make sure that every control signal that sent to the server are executed on client in the exact same way.
So the final result position should be the same and only diff if some signals sent to the server are lost (send too many in short time, network congestion...).
In that case the postion on client side will be fixed after not moving for a while in a smooth way (interpolate).
Hence, we have smooth reponsiveness when control character while still guarantee the last position in sync with server.

### Client

Every character has the current postion `(curX, curY)` and target position `(targetX, targetY)`. The current postion always move toward the target every game tick (15-20ms)

- Record state of keyboard when press or release

- Check and proceed control periodically (80ms),
  - if any move control at the moment
    - Send control signal to server
    - Execute control signal locally (update the target value, then should receive the same value from server after a time)
    - Reset the no move counting to 0
  - if no move control, start counting up, if more than 4 (> 320ms or 400ms)
    - Update the target to the latest received server position

- Receive ctrls, postions update from server for all characters

[code](https://github.com/dang1412/pixel-backend/blob/game/shooter-2d/pixel-app/src/app/libs/viewport/shooter/PixelShooter.ts#L132)

```ts
// Check and proceed control periodically (80ms)
setInterval(() => {

}, 80)

// update ctrl signals from server
updateCtrls(ctrls: CharacterControl[]) {
  for (let ctrl of ctrls) {
    const char = this.idCharacterMap[ctrl.id]
    if (!char) continue

    if (ctrl.id !== this.selectingShooterId) {
      // update from server
      char.ctrl.weapon = ctrl.weapon
      char.ctrl.fire = ctrl.fire
      char.ctrl.angle = ctrl.angle
    }

    if (ctrl.fire) {
      // perform shoot locally
      if (ctrl.weapon === 2 || ctrl.weapon === 3) this.shoot(ctrl.id)
    }
  }
}

// update position, hp from server
updateMatch(attrsArr: CharacterAttrs[]) {
  for (const attrs of attrsArr) {
    const id = attrs.id
    if (id >= 0 && attrs) {
      // add new shooter locally if not exist
      this.addShooter(id, attrs)

      const shooter = this.idCharacterMap[id]
      // latest server values, for the being controlled character to update when stop moving
      shooter.setLatestServer(attrs.x, attrs.y)
      if (id !== this.selectingShooterId) {
        // update current attrs, update position for not being controlled characters
        shooter.attrs = attrs
      }
    }
  }
}
```

## Shoot and hit

Every character on map is treated as an square 1x1
