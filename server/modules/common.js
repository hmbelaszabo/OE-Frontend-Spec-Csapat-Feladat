"use strict"

import { z } from "zod"

/** Közös mezőszabályok, hogy az 5 modul egyformán viselkedjen. */
export const idField = z.guid("must be a GUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)")
export const nameField = z.string().trim().min(1, "required").max(100, "max 100 characters")
export const stringList = z.array(z.string().trim().min(1).max(60)).max(10, "max 10 items")
export const imageField = z.union([z.literal(""), z.url("must be a URL or empty string")]).default("")
