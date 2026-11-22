"use strict"

import { z } from "zod"
import { createCrudRouter } from "../crud-router.js"
import { idField, imageField, nameField } from "./common.js"
import seed from "../seed/rockets.json" with { type: "json" }
import launches from "../seed/launches.json" with { type: "json" }

export const rocketSchema = z.strictObject({
  id: idField,
  name: nameField,
  manufacturer: z.string().trim().min(1, "required").max(60),
  payloadTons: z.number().positive("must be a positive number"),
  stages: z.int("must be an integer").min(1, "min 1").max(5, "max 5"),
  reusable: z.boolean(),
  costPerLaunch: z.number().positive("must be a positive number"),
  image: imageField
})

export default createCrudRouter({
  key: "space:rockets",
  entity: "Rocket",
  plural: "Rockets",
  schema: rocketSchema,
  seed,
  lookup: { path: "/getLaunches", data: launches }
})
