# Pixel Contracts

The contracts struture following this guide [Multiple contracts project](https://github.com/dang1412/ink-samples/tree/main/multiple_contracts_project) with 3 crates for 3 contracts

- Pixel contract
- Lottery game contract
- Adventure game contract

and a `common_traits` crate including implementation modules and common modules for the above 3 contracts

- pixel
- lottery
- adventure
- upgradable
- utils

## Pixel

- PSP34 NFT for Pixels on map.
- Managing image (on main map and on submap) on multiple pixels block.
- Market feature for Pixels.
- Renting feature for SubPixels - partial of a land/submap (TODO).

## Lottery Game

- Allowing user pick multiple subpixel at once.
- Managing number of pick for each pixel, each subpixel.
- Get pixels, subpixels picked by an account.
- Reward pixel owner for each pick.

## Adventure Game

Player

- Mintable PSP34 Beast NFT
- NFT equippable PSP37 items
- Track current beast position on map (not realtime - only before and after match)
- Move beast between lands paying fee
- Join match at current position

Admin (controlled by game server)

- Mint PSP37 items
- Move beast (when beast successfully exit match to enter a land)
- Update score kill/death
- Assign items ownership to a beast (collected on map)

## Common

- Upgradable: implement set_code function for contract logic upgrade
- Utils: helper functions calculating logic regarding pixel
  - Transalate back and forth between pixel id and coordination (x, y)
  - Encode/Decode set of subpixels (100) inside a pixel into/from u128

## Build

Build and deploy contract upgrade on-chain using shell script.
