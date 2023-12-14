# Pixel Backend

Pixelland is a simplified 2D Metaverse world combining advertisement and game.

Its 2D map is made up of a grid of tiles 100x100 NFT pixels, each pixel is divided into 10x10=100 sub-pixels.
Pixel owners can advertise things by putting the image on pixels, then it becomes land and can put more images inside.

We are building games to attract more traffic and bring users a new kind of experience where they can play, share, and explore exciting things at the same time.

> Unlike most of the metaverse projects that spend so many resources on building fancy 3D Worlds, we simplify the graphic aspect and focus on decentralized activities and protocols.

Include in this repo

- [Ink contracts](./contracts/)
  - Pixel NFT PSP34
  - Lottery game
  - Adventure game
    - Beast NFT PSP34
    - Item NFT PSP37

- [Nakama game server](./nakama/)
  - Adventure game
  - On-chain mode: server receives players' actions, interacts with and updates some information on-chain
  - Off-chain mode: server only connects clients together and then lets 1 client act as the server (calculate and push game state updates to other clients)

- [Adventure Engine](./adventure_engine/): Typescript module that receives actions and calculates game state updates, used in both
  - Game server for on-chain mode
  - Client app for off-chain mode

We are focusing on and developing the **adventure game** with criteria (and the same for future games)

- Easy to understand and interesting gameplay
- Light operations (turn-based..) that suitable for Blockchain
- Strong use cases for the game token

We are considering leveraging the [RMRK](https://github.com/rmrk-team/rmrk-ink) standard for NFTs combination, but for now, using very simple equipment implementation.

## Adventure Game
