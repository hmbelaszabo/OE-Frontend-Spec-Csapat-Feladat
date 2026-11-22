"use strict"

/*
 * Tiszta segédfüggvények az asztronauta-tömbhöz (rendezés, kategorizálás, formázás).
 * Egyik sem módosítja a kapott tömböt, és nem használ for / while ciklust.
 */

/** @typedef {import("./astronaut.js").Astronaut} Astronaut */

/**
 * Rendezett másolatot ad vissza – az eredeti tömb érintetlen marad.
 *
 * @param {Astronaut[]} astronauts - Az asztronauták tömbje.
 * @param {string} sortOrder - A #sort-select értéke.
 * @returns {Astronaut[]} Rendezett másolat.
 */
export function sortAstronauts(astronauts, sortOrder) {
  const copy = [...astronauts]

  switch (sortOrder) {
    case "age-asc":
      return copy.sort((a, b) => a.age - b.age)
    case "flightHours-desc":
      return copy.sort((a, b) => b.flightHours - a.flightHours)
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name, "hu"))
  }
}

/**
 * Kategorizálás repült óra szerint (bónusz).
 *
 * @param {Astronaut[]} astronauts - Az asztronauták tömbje.
 * @returns {{ rookie: Astronaut[], advanced: Astronaut[], veteran: Astronaut[] }} A három kategória.
 */
export function categorizeAstronauts(astronauts) {
  return {
    rookie: astronauts.filter((a) => a.flightHours < 1000),
    advanced: astronauts.filter((a) => a.flightHours >= 1000 && a.flightHours <= 5000),
    veteran: astronauts.filter((a) => a.flightHours > 5000)
  }
}

/**
 * Óraszám formázása, pl. 14900 → "14 900 óra".
 *
 * @param {number} hours - Repült órák száma.
 * @returns {string} Formázott szöveg.
 */
export function formatHours(hours) {
  return `${hours.toLocaleString("hu-HU")} óra`
}
