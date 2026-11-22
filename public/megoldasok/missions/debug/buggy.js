"use strict"

/*
 * ✅ MEGOLDÁS – a debug-feladat JAVÍTOTT változata (Küldetések).
 * A javítások magyarázata a DEBUG.md-ben található.
 */

/**
 * A küldetések átlagos költségvetése (millió $).
 *
 * @param {{ budget: number }[]} missions
 * @returns {number}
 */
export function averageBudget(missions) {
  let sum = 0

  // JAVÍTVA: <= helyett <, mert az utolsó index length - 1
  for (let i = 0; i < missions.length; i++) {
    sum += missions[i].budget
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
  // JAVÍTVA: a határ deklarációja a ciklus elé került (hoisting miatt eddig undefined volt)
  const limit = fromDate
  let count = 0

  for (const mission of missions) {
    if (mission.launchDate > limit) {
      count++
    }
  }

  return count
}
