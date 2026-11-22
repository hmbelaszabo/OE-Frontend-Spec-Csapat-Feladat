"use strict"

/*
 * Tiszta segédfüggvények a rakéta-tömbhöz (rendezés, kategorizálás, formázás).
 * Egyik sem módosítja a kapott tömböt, és nem használ for / while ciklust.
 */

/** @typedef {import("./rocket.js").Rocket} Rocket */

/**
 * Rendezett másolatot ad vissza – az eredeti tömb érintetlen marad.
 *
 * @param {Rocket[]} rockets - A rakéták tömbje.
 * @param {string} sortOrder - A #sort-select értéke.
 * @returns {Rocket[]} Rendezett másolat.
 */
export function sortRockets(rockets, sortOrder) {
  const copy = [...rockets]

  switch (sortOrder) {
    case "payloadTons-desc":
      return copy.sort((a, b) => b.payloadTons - a.payloadTons)
    case "costPerLaunch-asc":
      return copy.sort((a, b) => a.costPerLaunch - b.costPerLaunch)
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name, "hu"))
  }
}

/**
 * Kategorizálás teherbírás szerint (bónusz).
 *
 * @param {Rocket[]} rockets - A rakéták tömbje.
 * @returns {{ light: Rocket[], medium: Rocket[], heavy: Rocket[] }} A három kategória.
 */
export function categorizeRockets(rockets) {
  return {
    light: rockets.filter((r) => r.payloadTons < 10),
    medium: rockets.filter((r) => r.payloadTons >= 10 && r.payloadTons <= 50),
    heavy: rockets.filter((r) => r.payloadTons > 50)
  }
}

/**
 * Költség formázása, pl. 7.5 → "7,5 M$".
 *
 * @param {number} cost - Millió dollárban.
 * @returns {string} Formázott szöveg.
 */
export function formatCost(cost) {
  return `${cost.toLocaleString("hu-HU", { maximumFractionDigits: 1 })} M$`
}
