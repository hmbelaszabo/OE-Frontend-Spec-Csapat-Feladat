"use strict"

/*
 * 🐞 DEBUG-FELADAT – Asztronauták – [MEGOLDÁS: JAVÍTOTT VÁLTOZAT]
 * 1. countCommanders: értékadás (=) helyett a logikai érték vizsgálata.
 * 2. crewReport.labels: nyílfüggvény, így a callbackben is az objektum `this`-e érvényes.
 */

/**
 * Hány parancsnok van az asztronauták között.
 *
 * @param {{ isCommander: boolean }[]} astronauts
 * @returns {number}
 */
export function countCommanders(astronauts) {
  let count = 0

  for (const astronaut of astronauts) {
    if (astronaut.isCommander) {
      count++
    }
  }

  return count
}

/**
 * Névlista-készítő: minden név elé odateszi az előtagot.
 */
export const crewReport = {
  prefix: "Űrhajós",

  /**
   * @param {{ name: string }[]} astronauts
   * @returns {string[]} pl. ["Űrhajós: Kapu Tibor", ...]
   */
  labels(astronauts) {
    return astronauts.map((astronaut) => `${this.prefix}: ${astronaut.name}`)
  }
}
