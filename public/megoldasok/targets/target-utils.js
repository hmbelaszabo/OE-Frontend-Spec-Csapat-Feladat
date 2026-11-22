"use strict"

/*
 * Tiszta segédfüggvények a célpont-tömbhöz (rendezés, kategorizálás, formázás).
 * Egyik sem módosítja a kapott tömböt, és nem használ for / while ciklust.
 */

/** @typedef {import("./target.js").Target} Target */

/**
 * Rendezett másolatot ad vissza – az eredeti tömb érintetlen marad.
 *
 * @param {Target[]} targets - A célpontok tömbje.
 * @param {string} sortOrder - A #sort-select értéke.
 * @returns {Target[]} Rendezett másolat.
 */
export function sortTargets(targets, sortOrder) {
  const copy = [...targets]

  switch (sortOrder) {
    case "distanceMkm-asc":
      return copy.sort((a, b) => a.distanceMkm - b.distanceMkm)
    case "avgTempC-desc":
      return copy.sort((a, b) => b.avgTempC - a.avgTempC)
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name, "hu"))
  }
}

/**
 * Kategorizálás típus szerint (bónusz).
 *
 * @param {Target[]} targets - A célpontok tömbje.
 * @returns {{ planet: Target[], moon: Target[], asteroid: Target[] }} A három kategória.
 */
export function categorizeTargets(targets) {
  return {
    planet: targets.filter((t) => t.type === "planet"),
    moon: targets.filter((t) => t.type === "moon"),
    asteroid: targets.filter((t) => t.type === "asteroid")
  }
}

/**
 * A típus magyar felirata, pl. "moon" → "hold".
 *
 * @param {string} type - planet, moon vagy asteroid.
 * @returns {string} Magyar felirat.
 */
export function typeLabel(type) {
  switch (type) {
    case "planet":
      return "bolygó"
    case "moon":
      return "hold"
    default:
      return "kisbolygó"
  }
}
