"use strict"

/*
 * 🐞 DEBUG-FELADAT – Célpontok
 * Ebben a fájlban 2 hiba van. Nyisd meg a debug/index.html-t,
 * tegyél breakpointot a kódba, és a Scope / Call Stack panel segítségével
 * derítsd ki, mi a gond. A javítás után a táblázat minden sora zöld lesz.
 */

/**
 * Hőmérséklet-átváltó: a célpontok átlaghőmérséklete kelvinben.
 */
export const converter = {
  offset: 273.15,

  /**
   * @param {{ avgTempC: number }[]} targets
   * @returns {number[]}
   */
  toKelvin(targets) {
    return targets.map(function (target) {
      return Math.round((target.avgTempC + this.offset) * 100) / 100
    })
  }
}

/**
 * A három legközelebbi célpont neve. Az eredeti tömb sorrendje nem változhat!
 *
 * @param {{ name: string, distanceMkm: number }[]} targets
 * @returns {string[]}
 */
export function closestThree(targets) {
  const sorted = targets.sort((a, b) => a.distanceMkm - b.distanceMkm)
  return sorted.slice(0, 3).map((target) => target.name)
}
