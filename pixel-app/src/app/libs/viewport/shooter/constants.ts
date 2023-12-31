import { AssetsManifest } from 'pixi.js'

export const manifest: AssetsManifest = {
  bundles: [
    {
      name: 'man-idle-knife',
      assets: {
        'man_idle_knife_0': '/shooter/Idle_knife/Idle_knife_000.png',
        'man_idle_knife_1': '/shooter/Idle_knife/Idle_knife_001.png',
        'man_idle_knife_2': '/shooter/Idle_knife/Idle_knife_002.png',
        'man_idle_knife_3': '/shooter/Idle_knife/Idle_knife_003.png',
        'man_idle_knife_4': '/shooter/Idle_knife/Idle_knife_004.png',
        'man_idle_knife_5': '/shooter/Idle_knife/Idle_knife_005.png',
        'man_idle_knife_6': '/shooter/Idle_knife/Idle_knife_006.png',
        'man_idle_knife_7': '/shooter/Idle_knife/Idle_knife_007.png',
      }
    },
    {
      name: 'man-walk-knife',
      assets: {
        'man_walk_knife_0': '/shooter/Walk_knife/Walk_knife_000.png',
        'man_walk_knife_1': '/shooter/Walk_knife/Walk_knife_001.png',
        'man_walk_knife_2': '/shooter/Walk_knife/Walk_knife_002.png',
        'man_walk_knife_3': '/shooter/Walk_knife/Walk_knife_003.png',
        'man_walk_knife_4': '/shooter/Walk_knife/Walk_knife_004.png',
        'man_walk_knife_5': '/shooter/Walk_knife/Walk_knife_005.png',
      }
    },
    {
      name: 'man-hit-knife',
      assets: {
        'man_hit_knife_0': '/shooter/Knife/Knife_000.png',
        'man_hit_knife_1': '/shooter/Knife/Knife_001.png',
        'man_hit_knife_2': '/shooter/Knife/Knife_002.png',
        'man_hit_knife_3': '/shooter/Knife/Knife_003.png',
        'man_hit_knife_4': '/shooter/Knife/Knife_004.png',
        'man_hit_knife_5': '/shooter/Knife/Knife_005.png',
        'man_hit_knife_6': '/shooter/Knife/Knife_006.png',
        'man_hit_knife_7': '/shooter/Knife/Knife_007.png',
      }
    },
    {
      name: 'man-idle-gun',
      assets: {
        'man_idle_gun_0': '/shooter/Idle_gun/Idle_gun_000.png',
        'man_idle_gun_1': '/shooter/Idle_gun/Idle_gun_001.png',
        'man_idle_gun_2': '/shooter/Idle_gun/Idle_gun_002.png',
        'man_idle_gun_3': '/shooter/Idle_gun/Idle_gun_003.png',
        'man_idle_gun_4': '/shooter/Idle_gun/Idle_gun_004.png',
        'man_idle_gun_5': '/shooter/Idle_gun/Idle_gun_005.png',
        'man_idle_gun_6': '/shooter/Idle_gun/Idle_gun_006.png',
        'man_idle_gun_7': '/shooter/Idle_gun/Idle_gun_007.png',
      }
    },
    {
      name: 'man-walk-gun',
      assets: {
        'man_walk_gun_0': '/shooter/Walk_gun/Walk_gun_000.png',
        'man_walk_gun_1': '/shooter/Walk_gun/Walk_gun_001.png',
        'man_walk_gun_2': '/shooter/Walk_gun/Walk_gun_002.png',
        'man_walk_gun_3': '/shooter/Walk_gun/Walk_gun_003.png',
        'man_walk_gun_4': '/shooter/Walk_gun/Walk_gun_004.png',
        'man_walk_gun_5': '/shooter/Walk_gun/Walk_gun_005.png',
      }
    },
    {
      name: 'man-hit-gun',
      assets: {
        'man_hit_gun_0': '/shooter/Gun_Shot/Gun_Shot_000.png',
        'man_hit_gun_1': '/shooter/Gun_Shot/Gun_Shot_001.png',
        'man_hit_gun_2': '/shooter/Gun_Shot/Gun_Shot_002.png',
        'man_hit_gun_3': '/shooter/Gun_Shot/Gun_Shot_003.png',
        'man_hit_gun_4': '/shooter/Gun_Shot/Gun_Shot_004.png',
      }
    },
    {
      name: 'sample',
      assets: {

      }
    },
  ]
}

function manifestToCharacterStates(manifest: AssetsManifest): {[state: string]: string[]} {
  const states: {[state: string]: string[]} = {}

  for (const bundle of manifest.bundles) {
    const key = bundle.name
    states[key] = Object.keys(bundle.assets).sort()
  }

  return states
}

export const characterStates = manifestToCharacterStates(manifest)