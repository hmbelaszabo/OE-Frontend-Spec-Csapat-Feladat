"use strict"

import express from "express"
import app from "./app.js"
import { storeKind } from "./store.js"

/**
 * Lokális fejlesztői szerver (`npm run dev`).
 * Az API mellett a `public/` mappát is kiszolgálja, így a http://localhost:3000 címen
 * a teljes oldal fut. Live Serverrel (5500-as port) is használható, ld. public/shared/config.js.
 */
const PORT = Number(process.env.PORT) || 3000

const server = express()
server.use(app)
server.use(express.static(new URL("../public", import.meta.url).pathname))

server.listen(PORT, () => {
  console.log(`🚀 Űrügynökség: http://localhost:${PORT}  (API: /api, tároló: ${storeKind()})`)
})
