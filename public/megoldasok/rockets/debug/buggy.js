"use strict"

/*
 * ✅ MEGOLDÁS – a javított változat (a main-en a hibás buggy.js van).
 * 1. totalPayload: a szövegként érkező értékeket Number()-rel számmá alakítjuk.
 * 2. converter.totalInEuro: arrow function a callbackben, így a this a converter marad.
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
    total += Number(rocket.payloadTons)
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

    costs.forEach((cost) => {
      sum += cost * this.rate
    })

    return sum
  }
}
