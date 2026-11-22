"use strict"

/*
 * 🐞 DEBUG-FELADAT – Műholdak
 * Ebben a fájlban 2 függvény hibásan működik. Nyisd meg a debug/index.html-t,
 * tegyél breakpointot a függvényekbe, és a Scope / Call Stack panel segítségével
 * derítsd ki, mi a gond. A javítás után a táblázat minden sora zöld lesz.
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
      .map(function (satellite) {
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
  const year = launchYearInput.trim()
  return year + lifetimeYears
}
