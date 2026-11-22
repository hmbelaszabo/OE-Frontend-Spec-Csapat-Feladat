"use strict"

/*
 * 🐞 DEBUG-FELADAT – Küldetések
 * Ebben a fájlban 2 függvény hibásan működik. Nyisd meg a debug/index.html-t,
 * tegyél breakpointot a függvényekbe, és a Scope / Call Stack panel segítségével
 * derítsd ki, mi a gond. A javítás után a táblázat minden sora zöld lesz.
 */

/**
 * A küldetések átlagos költségvetése (millió $).
 *
 * @param {{ budget: number }[]} missions
 * @returns {number}
 */
export function averageBudget(missions) {
  let sum = 0

  for (let i = 0; i <= missions.length; i++) {
    sum += missions[i]?.budget
  }

  return sum / missions.length
}

/**
 * Hány küldetés indul a megadott nap után.
 *
 * @param {{ launchDate: string }[]} missions
 * @param {string} fromDate - YYYY-MM-DD
 * @returns {number}
 */
export function countUpcoming(missions, fromDate) {
  let count = 0

  for (const mission of missions) {
    if (mission.launchDate > limit) {
      count++
    }
  }

  var limit = fromDate
  return count
}
