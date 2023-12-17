import { PixelImage } from '@/libs/viewport'

export const mockImages: PixelImage[] = [
  {
    area: {x: 41, y: 33, w: 2, h: 2},
    imageUrl: '/images/cardano.jpg',
    title: 'Cardano',
    subtitle: 'Making The World Work Better For All',
    link: 'https://cardano.org/'
  },
  {
    // polygon
    area: {x: 37, y: 42, w: 5, h: 3},
    imageUrl: '/images/polygon-matic.jpg',
    title: 'Polygon',
    subtitle: 'Bringing the world to Ethereum',
    link: 'https://polygon.technology/',
    subImages: [
      {
        area: {x: 10, y: 5, w: 9, h: 6},
        imageUrl: '/images/QuickSwap-01.jpg',
        title: 'Quickswap',
        subtitle: 'Top Asset Exchange on the Polygon Network',
        link: 'https://quickswap.exchange/'
      },
    ]
  },
  {
    area: {x: 56, y: 34, w: 8, h: 3},
    imageUrl: '/images/the-sandbox.jpg',
    title: 'The Sandbox',
    subtitle: 'Creators can monetize voxel ASSETS and gaming experiences on the blockchain',
    link: 'https://www.sandbox.game/en/',
    subImages: [
      {
        area: {x: 19, y: 0, w: 10, h: 7},
        imageUrl: '/images/halloween.webp',
        title: 'PARIS HILTON CRYPTOWEEN',
        subtitle: 'Join the greatest Halloween party and get rewards. A 500K prize pool.',
        link: 'https://www.sandbox.game/en/season/contests/paris-hilton-cryptoween/'
      },
      {
        area: {x: 19, y: 9, w: 10, h: 7},
        imageUrl: '/images/halloween-2.webp',
        title: 'Alpha season 3 finale',
        subtitle: 'Join the last weekend of alpha season 3 with amazing rewards.',
        link: 'https://www.sandbox.game/en/season/'
      },
    ]
  },
  {
    area: {x: 48, y: 48, w: 3, h: 3},
    imageUrl: '/images/pixel_logo.png',
    title: 'PixelLand',
    subtitle: '100x100 grids NFT Billboard with 2D Metaverse gaming ecosystem',
    link: 'https://pixelland.io/'
  },
  {
    area: {x: 37, y: 53, w: 4, h: 4},
    imageUrl: '/images/polkadot-logo.png',
    title: 'Polkadot',
    subtitle: 'The blockspace ecosystem for boundless innovation',
    link: 'https://www.polkadot.network/',
    subImages: [
      {
        area: {x: 6, y: 5, w: 10, h: 10},
        imageUrl: '/images/moonbeam.png',
        title: 'Moonbeam',
        subtitle: 'Expand to new chains. Powered by Moonbeam, an Ethereum-compatible smart contract parachain on Polkadot',
        link: 'https://moonbeam.network/',
        subImages: [],
      }
    ],
  },
  {
    area: {x: 60, y: 48, w: 6, h: 4},
    imageUrl: '/images/avax2.jpg',
    title: 'Avalanche',
    subtitle: 'Welcome to Multiverse',
    link: 'https://www.avax.network/',
    subImages: [
      {
        area: {x: 12, y: 8, w: 15, h: 9},
        imageUrl: '/images/Trader-Joe.jpg',
        title: 'Trader Joe',
        subtitle: 'One-stop-shop decentralized trading on Avalanche',
        link: 'https://traderjoexyz.com'
      },
    ]
  },
  {
    area: {x: 49, y: 39, w: 6, h: 3},
    imageUrl: '/images/axie.jpg',
    title: 'Axie Infinity',
    subtitle: 'Axie Infinity is a virtual world filled with cute, formidable creatures known as Axies. Axies can be battled, bred, collected, and even used to earn resources & collectibles that can be traded on an open marketplace.',
    link: 'https://axieinfinity.com/',
    subImages: [
      {
        area: {x: 17, y: 2, w: 10, h: 6},
        imageUrl: '/images/Axie-Infinity-Guide-NoypiGeeks.jpg',
        title: 'Marketplace',
        subtitle: 'Axie-Infinity-Guide-NoypiGeeks',
        link: 'https://app.axieinfinity.com/marketplace/'
      },
      {
        area: {x: 19, y: 10, w: 10, h: 6},
        imageUrl: '/images/Axie_land_staking_banner.jpg',
        title: 'Axie land',
        subtitle: 'Land staking',
        link: 'https://app.axieinfinity.com/marketplace/lands/'
      },
      {
        area: {x: 4, y: 2, w: 8, h: 6},
        imageUrl: '/images/axie3.png',
        title: 'Cute Mavis',
        subtitle: 'Mystic Koi Cerastes Goda',
        link: 'https://app.axieinfinity.com/marketplace/axies/2078/'
      },
      {
        area: {x: 6, y: 11, w: 6, h: 3},
        imageUrl: '/images/mech.webp',
        title: 'Mechinfinity',
        subtitle: 'BATTLE – HAVE FUN – WIN PRIZES',
        link: 'https://www.mechinfinity.com/en'
      },
    ]
  },
  {
    area: {x: 50, y: 60, w: 5, h: 3},
    imageUrl: '/images/solana.png',
    title: 'Solana',
    subtitle: 'Powerful for developers. Fast for everyone.',
    link: 'https://solana.com/',
    subImages: [
      {
        area: {x: 16, y: 3, w: 8, h: 5},
        imageUrl: '/images/serum.jpg',
        title: 'Serum',
        subtitle: 'Faster, Cheaper and more Powerful DeFi',
        link: 'https://www.projectserum.com/'
      },
      {
        area: {x: 16, y: 12, w: 8, h: 5},
        imageUrl: '/images/Raydium.png',
        title: 'Raydium',
        subtitle: 'An avenue for the evolution of DeFi',
        link: 'https://raydium.io/'
      },
      {
        area: {x: 5, y: 5, w: 9, h: 9},
        imageUrl: '/images/stepn.png',
        title: 'Stepn',
        subtitle: 'WEB3 LIFESTYLE APP THAT REWARDS USERS FOR MOVEMENT',
        link: 'https://stepn.com/'
      },
    ]
  },
]