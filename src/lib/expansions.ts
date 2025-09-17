// Pokemon TCG Expansion and Set data structure
export interface Set {
  id: string
  name: string
  code: string
  releaseDate: string
}

export interface Expansion {
  id: string
  name: string
  sets: Set[]
}

export const expansions: Expansion[] = [
  {
    id: 'sv',
    name: 'Scarlet & Violet',
    sets: [
      { id: 'sv1', name: 'Scarlet & Violet', code: 'SV1', releaseDate: '2023-03-31' },
      { id: 'sv2', name: 'Paldea Evolved', code: 'SV2', releaseDate: '2023-06-09' },
      { id: 'sv3', name: 'Obsidian Flames', code: 'SV3', releaseDate: '2023-08-11' },
      { id: 'sv4', name: 'Paradox Rift', code: 'SV4', releaseDate: '2023-11-03' },
      { id: 'sv5', name: 'Temporal Forces', code: 'SV5', releaseDate: '2024-03-22' },
      { id: 'sv6', name: 'Twilight Masquerade', code: 'SV6', releaseDate: '2024-05-24' },
      { id: 'sv7', name: 'Stellar Crown', code: 'SV7', releaseDate: '2024-08-02' },
      { id: 'sv8', name: 'Surging Sparks', code: 'SV8', releaseDate: '2024-10-11' },
      { id: 'sv9', name: 'Journey Together', code: 'SV9', releaseDate: '2024-10-11' },
      { id: 'sv10', name: 'Destined Rivals', code: 'SV10', releaseDate: '2024-12-13' }
    ]
  },
  {
    id: 'swsh',
    name: 'Sword & Shield',
    sets: [
      { id: 'swsh1', name: 'Sword & Shield', code: 'SWSH1', releaseDate: '2020-02-07' },
      { id: 'swsh2', name: 'Rebel Clash', code: 'SWSH2', releaseDate: '2020-05-01' },
      { id: 'swsh3', name: 'Darkness Ablaze', code: 'SWSH3', releaseDate: '2020-08-14' },
      { id: 'swsh4', name: 'Vivid Voltage', code: 'SWSH4', releaseDate: '2020-11-13' },
      { id: 'swsh5', name: 'Battle Styles', code: 'SWSH5', releaseDate: '2021-03-19' },
      { id: 'swsh6', name: 'Chilling Reign', code: 'SWSH6', releaseDate: '2021-06-18' },
      { id: 'swsh7', name: 'Evolving Skies', code: 'SWSH7', releaseDate: '2021-08-27' },
      { id: 'swsh8', name: 'Fusion Strike', code: 'SWSH8', releaseDate: '2021-11-12' },
      { id: 'swsh9', name: 'Brilliant Stars', code: 'SWSH9', releaseDate: '2022-02-25' },
      { id: 'swsh10', name: 'Astral Radiance', code: 'SWSH10', releaseDate: '2022-05-27' },
      { id: 'swsh11', name: 'Lost Origin', code: 'SWSH11', releaseDate: '2022-09-09' },
      { id: 'swsh12', name: 'Silver Tempest', code: 'SWSH12', releaseDate: '2022-11-11' },
      { id: 'swsh13', name: 'Crown Zenith', code: 'SWSH13', releaseDate: '2023-01-20' }
    ]
  },
  {
    id: 'sm',
    name: 'Sun & Moon',
    sets: [
      { id: 'sm1', name: 'Sun & Moon', code: 'SM1', releaseDate: '2017-02-03' },
      { id: 'sm2', name: 'Guardians Rising', code: 'SM2', releaseDate: '2017-05-05' },
      { id: 'sm3', name: 'Burning Shadows', code: 'SM3', releaseDate: '2017-08-04' },
      { id: 'sm4', name: 'Crimson Invasion', code: 'SM4', releaseDate: '2017-11-03' },
      { id: 'sm5', name: 'Ultra Prism', code: 'SM5', releaseDate: '2018-02-02' },
      { id: 'sm6', name: 'Forbidden Light', code: 'SM6', releaseDate: '2018-05-04' },
      { id: 'sm7', name: 'Celestial Storm', code: 'SM7', releaseDate: '2018-08-03' },
      { id: 'sm8', name: 'Lost Thunder', code: 'SM8', releaseDate: '2018-11-02' },
      { id: 'sm9', name: 'Team Up', code: 'SM9', releaseDate: '2019-02-01' },
      { id: 'sm10', name: 'Detective Pikachu', code: 'SM10', releaseDate: '2019-04-05' },
      { id: 'sm11', name: 'Unbroken Bonds', code: 'SM11', releaseDate: '2019-05-03' },
      { id: 'sm12', name: 'Unified Minds', code: 'SM12', releaseDate: '2019-08-02' },
      { id: 'sm13', name: 'Hidden Fates', code: 'SM13', releaseDate: '2019-08-23' },
      { id: 'sm14', name: 'Cosmic Eclipse', code: 'SM14', releaseDate: '2019-11-01' }
    ]
  },
  {
    id: 'xy',
    name: 'X & Y',
    sets: [
      { id: 'xy1', name: 'X & Y', code: 'XY1', releaseDate: '2014-02-05' },
      { id: 'xy2', name: 'Flashfire', code: 'XY2', releaseDate: '2014-05-07' },
      { id: 'xy3', name: 'Furious Fists', code: 'XY3', releaseDate: '2014-08-13' },
      { id: 'xy4', name: 'Phantom Forces', code: 'XY4', releaseDate: '2014-11-05' },
      { id: 'xy5', name: 'Primal Clash', code: 'XY5', releaseDate: '2015-02-04' },
      { id: 'xy6', name: 'Roaring Skies', code: 'XY6', releaseDate: '2015-05-06' },
      { id: 'xy7', name: 'Ancient Origins', code: 'XY7', releaseDate: '2015-08-12' },
      { id: 'xy8', name: 'Breakthrough', code: 'XY8', releaseDate: '2015-11-04' },
      { id: 'xy9', name: 'Breakpoint', code: 'XY9', releaseDate: '2016-02-03' },
      { id: 'xy10', name: 'Fates Collide', code: 'XY10', releaseDate: '2016-05-04' },
      { id: 'xy11', name: 'Steam Siege', code: 'XY11', releaseDate: '2016-08-03' },
      { id: 'xy12', name: 'Evolutions', code: 'XY12', releaseDate: '2016-11-02' }
    ]
  },
  {
    id: 'bw',
    name: 'Black & White',
    sets: [
      { id: 'bw1', name: 'Black & White', code: 'BW1', releaseDate: '2011-04-25' },
      { id: 'bw2', name: 'Emerging Powers', code: 'BW2', releaseDate: '2011-08-31' },
      { id: 'bw3', name: 'Noble Victories', code: 'BW3', releaseDate: '2011-11-16' },
      { id: 'bw4', name: 'Next Destinies', code: 'BW4', releaseDate: '2012-02-08' },
      { id: 'bw5', name: 'Dark Explorers', code: 'BW5', releaseDate: '2012-05-09' },
      { id: 'bw6', name: 'Dragons Exalted', code: 'BW6', releaseDate: '2012-08-15' },
      { id: 'bw7', name: 'Boundaries Crossed', code: 'BW7', releaseDate: '2012-11-07' },
      { id: 'bw8', name: 'Plasma Storm', code: 'BW8', releaseDate: '2013-02-06' },
      { id: 'bw9', name: 'Plasma Freeze', code: 'BW9', releaseDate: '2013-05-08' },
      { id: 'bw10', name: 'Plasma Blast', code: 'BW10', releaseDate: '2013-08-14' },
      { id: 'bw11', name: 'Legendary Treasures', code: 'BW11', releaseDate: '2013-11-08' }
    ]
  }
]

// Helper functions
export function getExpansions(): Expansion[] {
  return expansions
}

export function getExpansionById(id: string): Expansion | undefined {
  return expansions.find(expansion => expansion.id === id)
}

export function getSetById(setId: string): Set | undefined {
  for (const expansion of expansions) {
    const set = expansion.sets.find(set => set.id === setId)
    if (set) return set
  }
  return undefined
}

export function getSetsByExpansion(expansionId: string): Set[] {
  const expansion = getExpansionById(expansionId)
  return expansion?.sets || []
}

export function getExpansionBySetId(setId: string): Expansion | undefined {
  for (const expansion of expansions) {
    if (expansion.sets.some(set => set.id === setId)) {
      return expansion
    }
  }
  return undefined
}
