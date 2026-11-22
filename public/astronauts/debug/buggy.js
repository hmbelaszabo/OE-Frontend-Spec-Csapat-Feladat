"use strict"

/*
 * 🐞 DEBUG-FELADAT – Asztronauták
 * Ebben a fájlban 2 függvény hibásan működik. Nyisd meg a debug/index.html-t,
 * tegyél breakpointot a függvényekbe, és a Scope / Call Stack panel segítségével
 * derítsd ki, mi a gond. A javítás után a táblázat minden sora zöld lesz.
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
    if (astronaut.isCommander = true) {
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
    return astronauts.map(function (astronaut) {
      return `${this.prefix}: ${astronaut.name}`
    })
  }
}
