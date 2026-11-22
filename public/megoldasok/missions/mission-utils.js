"use strict"

/*
 * Tiszta segédfüggvények a küldetés-tömbhöz (rendezés, kategorizálás, formázás).
 * Egyik sem módosítja a kapott tömböt, és nem használ for / while ciklust.
 */

/** @typedef {import("./mission.js").Mission} Mission */

/**
 * Jövőbeli-e a küldetés, vagyis a mai napnál későbbi-e az indítási dátuma.
 * A dátumok ÉÉÉÉ-HH-NN formájúak, ezért szövegként is összehasonlíthatók.
 *
 * @param {Mission} mission - A vizsgált küldetés.
 * @returns {boolean} Igaz, ha még nem indult el.
 */
export function isUpcoming(mission) {
  const today = new Date().toISOString().slice(0, 10)
  return mission.launchDate > today
}

/**
 * Rendezett másolatot ad vissza – az eredeti tömb érintetlen marad.
 *
 * @param {Mission[]} missions - A küldetések tömbje.
 * @param {string} sortOrder - A #sort-select értéke.
 * @returns {Mission[]} Rendezett másolat.
 */
export function sortMissions(missions, sortOrder) {
  const copy = [...missions]

  switch (sortOrder) {
    case "budget-desc":
      return copy.sort((a, b) => b.budget - a.budget)
    case "durationDays-desc":
      return copy.sort((a, b) => b.durationDays - a.durationDays)
    case "launchDate-asc":
      return copy.sort((a, b) => a.launchDate.localeCompare(b.launchDate))
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name, "hu"))
  }
}

/**
 * Kategorizálás költségvetés szerint (bónusz).
 *
 * @param {Mission[]} missions - A küldetések tömbje.
 * @returns {{ small: Mission[], medium: Mission[], large: Mission[] }} A három kategória.
 */
export function categorizeMissions(missions) {
  return {
    small: missions.filter((m) => m.budget < 1000),
    medium: missions.filter((m) => m.budget >= 1000 && m.budget <= 5000),
    large: missions.filter((m) => m.budget > 5000)
  }
}

/**
 * Költségvetés formázása, pl. 4100 → "4100 M$", 10000 → "10 000 M$".
 *
 * @param {number} budget - Millió dollárban.
 * @returns {string} Formázott szöveg.
 */
export function formatBudget(budget) {
  return `${budget.toLocaleString("hu-HU", { maximumFractionDigits: 1 })} M$`
}
