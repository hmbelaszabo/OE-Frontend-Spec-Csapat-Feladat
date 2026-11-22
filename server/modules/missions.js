"use strict"

import { z } from "zod"
import { createCrudRouter } from "../crud-router.js"
import { idField, nameField, stringList } from "./common.js"
import seed from "../seed/missions.json" with { type: "json" }
import rocketOptions from "../seed/rocket-options.json" with { type: "json" }

export const missionSchema = z.strictObject({
  id: idField,
  name: nameField,
  rocketId: z.string(),
  budget: z.number().positive("must be a positive number"),
  durationDays: z.int("must be an integer").positive("must be a positive number"),
  launchDate: z.iso.date("must be a date (YYYY-MM-DD)"),
  successful: z.boolean(),
  objectives: stringList
})

export default createCrudRouter({
  key: "space:missions",
  entity: "Mission",
  plural: "Missions",
  schema: missionSchema,
  seed,
  lookup: { path: "/getRocketOptions", data: rocketOptions },
  ref: { field: "rocketId" }
})
