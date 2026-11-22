"use strict"

import { z } from "zod"
import { createCrudRouter } from "../crud-router.js"
import { idField, imageField, nameField, stringList } from "./common.js"
import seed from "../seed/astronauts.json" with { type: "json" }
import missionOptions from "../seed/mission-options.json" with { type: "json" }

export const astronautSchema = z.strictObject({
  id: idField,
  name: nameField,
  nationality: z.string().trim().min(1, "required").max(40),
  age: z.int("must be an integer").min(18, "min 18").max(80, "max 80"),
  flightHours: z.number().min(0, "must not be negative"),
  isCommander: z.boolean(),
  missionId: z.string().nullable(),
  skills: stringList,
  image: imageField
})

export default createCrudRouter({
  key: "space:astronauts",
  entity: "Astronaut",
  plural: "Astronauts",
  schema: astronautSchema,
  seed,
  lookup: { path: "/getMissionOptions", data: missionOptions },
  ref: { field: "missionId", nullable: true }
})
