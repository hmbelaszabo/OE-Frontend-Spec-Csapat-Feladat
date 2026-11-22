"use strict"

/*
 * 🐞 DEBUG-FELADAT – Rakéták
 * Ebben a fájlban 2 függvény hibásan működik. Nyisd meg a debug/index.html-t,
 * tegyél breakpointot a függvényekbe, és a Scope / Call Stack panel segítségével
 * derítsd ki, mi a gond. A javítás után a táblázat minden sora zöld lesz.
 */

/**
 * A rakéták összes teherbírása tonnában.
 * Az értékek egy űrlapból érkeznek, ezért szövegként (pl. "20").
 *
 * @param {{ payloadTons: string }[]} rockets
 * @returns {number}
 */
export function totalPayload(rockets) {
  let total = 0

  for (const rocket of rockets) {
    total += rocket.payloadTons
  }

  return total
}

/**
 * Költségátváltó: dollárból euróba számolja az indítási költségek összegét.
 */
export const converter = {
  rate: 0.9,

  /**
   * @param {number[]} costs - millió dollárban
   * @returns {number} millió euróban
   */
  totalInEuro(costs) {
    let sum = 0

    costs.forEach(function (cost) {
      sum += cost * this.rate
    })

    return sum
  }
}
