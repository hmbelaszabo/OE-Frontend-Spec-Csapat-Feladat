"use strict"

/*
 * ✅ MEGOLDÁS – Műholdak debug-feladat (javított változat)
 * 1. massReport.format: a map callbackje arrow function, így a this a massReport objektum marad.
 * 2. retirementYear: a szövegként kapott évet Number()-rel számmá alakítjuk, így a + összead.
 */

/**
 * Tömegjelentés: minden műhold tömegét tonnában írja ki.
 */
export const massReport = {
  unit: "t",
  divisor: 1000,

  /**
   * @param {{ name: string, massKg: number }[]} satellites
   * @returns {string} pl. "Hubble: 11.11 t; Juno: 3.625 t"
   */
  format(satellites) {
    return satellites
      .map((satellite) => {
        return `${satellite.name}: ${satellite.massKg / this.divisor} ${this.unit}`
      })
      .join("; ")
  }
}

/**
 * Melyik évben éri el a műhold a tervezett élettartamát.
 * Az indítási év egy űrlapmezőből érkezik, ezért szövegként kapjuk meg.
 *
 * @param {string} launchYearInput - pl. " 2013 "
 * @param {number} lifetimeYears
 * @returns {number}
 */
export function retirementYear(launchYearInput, lifetimeYears) {
  const year = Number(launchYearInput.trim())
  return year + lifetimeYears
}
