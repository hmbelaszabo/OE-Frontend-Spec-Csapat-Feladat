"use strict"

import { z } from "zod"
import { createCrudRouter } from "../crud-router.js"
import { idField, nameField, stringList } from "./common.js"
import seed from "../seed/satellites.json" with { type: "json" }
import targetOptions from "../seed/target-options.json" with { type: "json" }

export const satelliteSchema = z.strictObject({
  id: idField,
  name: nameField,
  targetId: z.string(),
  altitudeKm: z.number().positive("must be a positive number"),
  massKg: z.number().positive("must be a positive number"),
  launchYear: z.int("must be an integer").min(1957, "min 1957").max(2100, "max 2100"),
  operational: z.boolean(),
  instruments: stringList
})

export default createCrudRouter({
  key: "space:satellites",
  entity: "Satellite",
  plural: "Satellites",
  schema: satelliteSchema,
  seed,
  lookup: { path: "/getTargetOptions", data: targetOptions },
  ref: { field: "targetId" }
})
