"use strict"

/**
 * Egy műhold adatai – pontosan az API által várt mezőkkel.
 */
export class Satellite {
  id
  name
  targetId
  altitudeKm
  massKg
  launchYear
  operational
  instruments = []
}
