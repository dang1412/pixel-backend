# Nakama Game Server

Template
https://github.com/heroiclabs/nakama-project-template

```sh
# build with rollup
npm run build

# migrate for the first time
nakama.exe migrate up --database.address postgres:a@127.0.0.1:5432

# run
nakama --config local.yml
```

## Init

When server start

- Register handlers for the match `adventure_match`
  - matchInit,
  - matchJoinAttempt,
  - matchJoin,
  - matchLeave,
  - matchLoop,
  - matchSignal,
  - matchTerminate

- Create the match `adventure_match`

## Match Handlers

### matchInit

- Initialize empty match state
- Set tick rate 1 (game loop run once a sec)

```ts
interface AdventureState {
  presences: {[userId: string]: nkruntime.Presence}
  beastPosition: {[id: number]: number}
  positionBeast: {[pixel: number]: number}
  beastOnboard: number[]
}
```

### matchJoinAttempt

Decide if user can join or not, currently do nothing other than return `accept: true`.

### matchJoin

Run once when user join, send user the current game state: positions of all monsters

### matchLeave

Run once when user leave (or network disconnect)

- Remove map value `uuid -> pubkey[]`

### matchLoop

Run `tickRate` time(s) (1 in this case) per second.

- Process login messages (opcode 0).
- Process onboard messages (opcode 1).
- Process all the monster's actions (opcode 2: move, opcode 3: shoot).

### matchSignal

### matchTerminate

## Main Logic

### Login/Authentication

- When open match, client join the match with uuid to get match realtime info.

- When login, user send public key, current timestamp, signature for the timestamp to the server.

- Server verify, store info in a map: `uuid -> pubkey[]`

### Onboard monster

- Get monster's owner on-chain, reject if the caller is not owner.

- Get monster equipments, calculate its attributes: health, shoot range, move range...

- If the position not empty put the monster landing request to waiting queue.

### Process actions

- Check if action come from owner.

- Process actions in order, update match state.
  - move
  - shoot
  - equip
    - client update onchain and inform server
    - server confirm equipped data onchain, update game states

- Calculate state changes, encode using flatbuffer and send to all clients.

## Flatbuffer

Encode, decode game state updates

```ts
interface BeastActionI {
  id: number
  target: number
}

interface UpdateStateI {
  beastMoves: BeastActionI[]
  beastShoots: BeastActionI[]
  beastDeaths: number[]
}
```

## Update on-chain

Server holds an admin account who has the priviledges to update some data on-chain.

- Onboard monster from a land (every monster starting from the central **Pixelland**).
- Give ownership of NFT equipment on the map to an account (when player collect item successfully on the map).
- Update NFT monster score, experience, level.
- Offboard monster, put to a land (when player enter a land to escape from the field successfully).