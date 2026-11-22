"use strict"

/*
 * ✅ MEGOLDÁS – Célpontok debug-feladat, JAVÍTOTT változat.
 * (A feladatban kapott hibás változat a public/targets/debug/buggy.js-ben van.)
 * 1. converter.toKelvin: a map callbackje arrow function, így a this a converter objektum marad.
 * 2. closestThree: a rendezés egy másolaton történik, az eredeti tömb sorrendje nem változik.
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
    return targets.map((target) => {
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
  const sorted = [...targets].sort((a, b) => a.distanceMkm - b.distanceMkm)
  return sorted.slice(0, 3).map((target) => target.name)
}
