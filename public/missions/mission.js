"use strict"

/**
 * Egy űrküldetés adatai – pontosan az API által várt mezőkkel.
 */
export class Mission {
  id
  name
  rocketId
  budget
  durationDays
  launchDate
  successful
  objectives = []
}
