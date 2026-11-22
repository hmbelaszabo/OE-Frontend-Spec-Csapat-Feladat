"use strict"

/*
 * Tiszta segédfüggvények a műhold-tömbhöz (rendezés, kategorizálás, formázás).
 * Egyik sem módosítja a kapott tömböt, és nem használ for / while ciklust.
 */

/** @typedef {import("./satellite.js").Satellite} Satellite */

/**
 * Rendezett másolatot ad vissza – az eredeti tömb érintetlen marad.
 *
 * @param {Satellite[]} satellites - A műholdak tömbje.
 * @param {string} sortOrder - A #sort-select értéke.
 * @returns {Satellite[]} Rendezett másolat.
 */
export function sortSatellites(satellites, sortOrder) {
  const copy = [...satellites]

  switch (sortOrder) {
    case "altitudeKm-asc":
      return copy.sort((a, b) => a.altitudeKm - b.altitudeKm)
    case "launchYear-asc":
      return copy.sort((a, b) => a.launchYear - b.launchYear)
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name, "hu"))
  }
}

/**
 * Kategorizálás pályamagasság szerint (bónusz).
 *
 * @param {Satellite[]} satellites - A műholdak tömbje.
 * @returns {{ leo: Satellite[], meo: Satellite[], geo: Satellite[] }} A három kategória.
 */
export function categorizeSatellites(satellites) {
  return {
    leo: satellites.filter((s) => s.altitudeKm < 2000),
    meo: satellites.filter((s) => s.altitudeKm >= 2000 && s.altitudeKm < 35786),
    geo: satellites.filter((s) => s.altitudeKm >= 35786)
  }
}

/**
 * Szám formázása magyar ezres tagolással, pl. 11110 → "11 110".
 *
 * @param {number} value - A formázandó szám.
 * @returns {string} Formázott szöveg.
 */
export function formatNumber(value) {
  return value.toLocaleString("hu-HU", { maximumFractionDigits: 1 })
}
