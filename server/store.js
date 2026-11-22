"use strict"

import { Redis } from "@upstash/redis"

/**
 * Egyszerű kulcs → tömb tároló.
 *
 * Ha be vannak állítva az Upstash (vagy a Vercel KV-integráció) környezeti változói,
 * Redisbe ír; különben a memóriában tárol (lokális fejlesztés, tesztek).
 * Modulonként egyetlen kulcs van (pl. `space:missions`), értéke a teljes JSON-tömb.
 */

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

const redis = url && token ? new Redis({ url, token }) : null
const memory = new Map()

/** @returns {"redis"|"memory"} Az aktív tároló típusa. */
export const storeKind = () => (redis ? "redis" : "memory")

/**
 * Beolvassa a kulcshoz tartozó tömböt. Ha még nincs, a seed másolatával inicializálja.
 *
 * @param {string} key - Tárolókulcs.
 * @param {object[]} seed - Kezdőadatok.
 * @returns {Promise<object[]>}
 */
export async function readList(key, seed) {
  const stored = redis ? await redis.get(key) : memory.get(key)

  if (Array.isArray(stored)) {
    return structuredClone(stored)
  }

  const initial = structuredClone(seed)
  await writeList(key, initial)
  return structuredClone(initial)
}

/**
 * Felülírja a kulcshoz tartozó tömböt.
 *
 * @param {string} key - Tárolókulcs.
 * @param {object[]} list - Az új tartalom.
 * @returns {Promise<void>}
 */
export async function writeList(key, list) {
  if (redis) {
    await redis.set(key, list)
  } else {
    memory.set(key, structuredClone(list))
  }
}

/** Kiüríti a memóriás tárolót (csak tesztekhez). */
export function clearMemory() {
  memory.clear()
}
