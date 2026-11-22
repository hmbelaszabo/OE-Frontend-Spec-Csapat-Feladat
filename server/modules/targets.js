"use strict"

import { z } from "zod"
import { createCrudRouter } from "../crud-router.js"
import { idField, nameField } from "./common.js"
import seed from "../seed/targets.json" with { type: "json" }
import visits from "../seed/visits.json" with { type: "json" }

export const targetSchema = z.strictObject({
  id: idField,
  name: nameField,
  type: z.enum(["planet", "moon", "asteroid"], "must be planet, moon or asteroid"),
  distanceMkm: z.number().min(0, "must not be negative"),
  avgTempC: z.number().min(-273.15, "below absolute zero"),
  habitable: z.boolean(),
  moons: z.int("must be an integer").min(0, "must not be negative"),
  gravity: z.number().min(0, "must not be negative")
})

export default createCrudRouter({
  key: "space:targets",
  entity: "Target",
  plural: "Targets",
  schema: targetSchema,
  seed,
  lookup: { path: "/getVisits", data: visits }
})
