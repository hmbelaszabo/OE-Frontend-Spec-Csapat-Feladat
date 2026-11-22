"use strict"

import express from "express"
import missions from "./modules/missions.js"
import astronauts from "./modules/astronauts.js"
import rockets from "./modules/rockets.js"
import targets from "./modules/targets.js"
import satellites from "./modules/satellites.js"
import { storeKind } from "./store.js"

const app = express()

app.disable("x-powered-by")

// CORS: bárhonnan hívható (pl. Live Server: http://127.0.0.1:5500)
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.set("Access-Control-Allow-Headers", "Content-Type")
  if (req.method === "OPTIONS") return res.sendStatus(204)
  next()
})

app.use(express.json({ limit: "10kb" }))

// Szimuláció: ?delay=ms (max 5000) és ?fail=true – spinner és hibakezelés gyakorlásához
app.use(async (req, res, next) => {
  const delay = Math.min(Number(req.query.delay) || 0, 5000)

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  if (req.query.fail === "true") {
    return res.status(500).json({ error: "Simulated failure (?fail=true)" })
  }
  next()
})

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", store: storeKind() })
})

app.use("/api/missions", missions)
app.use("/api/astronauts", astronauts)
app.use("/api/rockets", rockets)
app.use("/api/targets", targets)
app.use("/api/satellites", satellites)

app.use("/api", (req, res) => {
  res.status(404).json({ error: `Unknown endpoint: ${req.method} ${req.originalUrl}` })
})

// Hibakezelő: hibás JSON, túl nagy body, váratlan hiba
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" })
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Body too large (max 10 kB)" })
  }
  console.error(err)
  res.status(500).json({ error: "Internal server error" })
})

export default app
