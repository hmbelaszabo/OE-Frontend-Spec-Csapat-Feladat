"use strict"

import { Router } from "express"
import { readList, writeList } from "./store.js"

/** Egy modulban tárolható elemek felső korlátja. */
export const MAX_ITEMS = 50

/**
 * A Zod-hibákat a közös hibaformátumra alakítja:
 * `{ error: "Validation failed", fields: { mezo: "üzenet" } }`
 *
 * @param {import("zod").ZodError} zodError
 * @returns {Record<string, string>}
 */
function toFieldErrors(zodError) {
  const fields = {}

  for (const issue of zodError.issues) {
    const path = issue.path.join(".") || "body"
    fields[path] ??= issue.message
  }

  return fields
}

/**
 * Egységes CRUD-routert készít egy modulhoz, a tanári API mintájára:
 *
 * - `GET    /get<Plural>`      – teljes lista
 * - `POST   /create<Entity>`   – teljes objektum, az `id`-t a kliens generálja (GUID)
 * - `PUT    /update<Entity>`   – teljes objektum `id`-val
 * - `DELETE /delete<Entity>`   – body: `{ id }`
 * - `POST   /reset`            – visszaállítja a seed adatokat
 * - `GET    /<lookup>`         – a modul saját, csak olvasható lookup-végpontja
 *
 * @param {object} config
 * @param {string} config.key - Tárolókulcs (pl. `space:missions`).
 * @param {string} config.entity - Egyes számú név (pl. `Mission`).
 * @param {string} config.plural - Többes számú név (pl. `Missions`).
 * @param {import("zod").ZodObject} config.schema - A teljes objektum sémája.
 * @param {object[]} config.seed - Kezdőadatok.
 * @param {{ path: string, data: object[] }} config.lookup - Csak olvasható lookup-adat.
 * @param {{ field: string, nullable?: boolean }} [config.ref] - Az `id`-nak a lookupban kell szerepelnie.
 * @returns {import("express").Router}
 */
export function createCrudRouter({ key, entity, plural, schema, seed, lookup, ref }) {
  const router = Router()

  /**
   * Validálja a kérés törzsét; hiba esetén 400-zal válaszol és `null`-t ad vissza.
   */
  const validate = (req, res) => {
    const result = schema.safeParse(req.body ?? {})

    if (!result.success) {
      res.status(400).json({ error: "Validation failed", fields: toFieldErrors(result.error) })
      return null
    }

    if (ref) {
      const value = result.data[ref.field]
      const known = lookup.data.some((option) => option.id === value)

      if (!(known || (ref.nullable && value === null))) {
        res.status(400).json({
          error: "Validation failed",
          fields: { [ref.field]: `unknown id (see GET ${lookup.path})` }
        })
        return null
      }
    }

    return result.data
  }

  router.get(`/get${plural}`, async (req, res) => {
    res.json(await readList(key, seed))
  })

  router.post(`/create${entity}`, async (req, res) => {
    const item = validate(req, res)
    if (!item) return

    const list = await readList(key, seed)

    if (list.length >= MAX_ITEMS) {
      return res.status(409).json({ error: `Limit reached: max ${MAX_ITEMS} items. Use POST /reset.` })
    }
    if (list.some((x) => x.id === item.id)) {
      return res.status(409).json({ error: "An item with this id already exists" })
    }

    list.push(item)
    await writeList(key, list)
    res.status(201).json(item)
  })

  router.put(`/update${entity}`, async (req, res) => {
    const item = validate(req, res)
    if (!item) return

    const list = await readList(key, seed)
    const index = list.findIndex((x) => x.id === item.id)

    if (index === -1) {
      return res.status(404).json({ error: "Item not found" })
    }

    list[index] = item
    await writeList(key, list)
    res.json(item)
  })

  router.delete(`/delete${entity}`, async (req, res) => {
    const id = req.body?.id

    if (typeof id !== "string" || id.length === 0) {
      return res.status(400).json({ error: "Validation failed", fields: { id: "required" } })
    }

    const list = await readList(key, seed)
    const index = list.findIndex((x) => x.id === id)

    if (index === -1) {
      return res.status(404).json({ error: "Item not found" })
    }

    list.splice(index, 1)
    await writeList(key, list)
    res.json({ id })
  })

  router.post("/reset", async (req, res) => {
    await writeList(key, seed)
    res.json(structuredClone(seed))
  })

  router.get(lookup.path, (req, res) => {
    res.json(lookup.data)
  })

  return router
}
