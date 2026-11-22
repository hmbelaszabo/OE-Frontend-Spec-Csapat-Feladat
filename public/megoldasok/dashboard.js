"use strict"

/*
 * [MEGOLDÁS – közös bónusz] Mission Control dashboard.
 * Mind az öt modul get… végpontját párhuzamosan lekéri (Promise.all),
 * és tömbmetódusokkal (reduce, filter) összesít.
 */

import { API_BASE } from "../shared/config.js"

/** Modulonként: végpont, felirat, ikon és egy összesítő szöveg. */
const sources = [
  {
    url: `${API_BASE}/missions/getMissions`,
    title: "Küldetés",
    icon: "bi-flag",
    detail: (items) => `${items.reduce((sum, m) => sum + m.budget, 0).toLocaleString("hu-HU")} M$ összesen`
  },
  {
    url: `${API_BASE}/astronauts/getAstronauts`,
    title: "Asztronauta",
    icon: "bi-person-badge",
    detail: (items) => `${items.filter((a) => a.missionId !== null).length} beosztva`
  },
  {
    url: `${API_BASE}/rockets/getRockets`,
    title: "Rakéta",
    icon: "bi-rocket-takeoff",
    detail: (items) => `${items.filter((r) => r.reusable).length} újrahasznosítható`
  },
  {
    url: `${API_BASE}/targets/getTargets`,
    title: "Célpont",
    icon: "bi-globe-americas",
    detail: (items) => `${items.filter((t) => t.habitable).length} lakható`
  },
  {
    url: `${API_BASE}/satellites/getSatellites`,
    title: "Műhold",
    icon: "bi-broadcast",
    detail: (items) => `${items.filter((s) => s.operational).length} működik`
  }
]

/**
 * JSON lekérése státuszkód-ellenőrzéssel.
 *
 * @param {string} url
 * @returns {Promise<object[]>}
 */
async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Nem sikerült betölteni: ${url} (HTTP ${response.status})`)
  }
  return response.json()
}

/**
 * Lekéri és kirajzolja a dashboardot.
 *
 * @returns {Promise<void>}
 */
async function loadDashboard() {
  const loading = document.querySelector("#dashboard-loading")
  const error = document.querySelector("#dashboard-error")
  const target = document.querySelector("#dashboard")
  const template = document.querySelector("#dashboard-tile")

  loading.classList.remove("d-none")
  error.classList.add("d-none")

  try {
    const results = await Promise.all(sources.map((source) => getJson(source.url)))

    const tiles = results.map((items, index) => {
      const { title, icon, detail } = sources[index]
      const tile = template.content.cloneNode(true)
      tile.querySelector(".tile-icon").className = `tile-icon page-icon me-1 bi ${icon}`
      tile.querySelector(".tile-title").textContent = title
      tile.querySelector(".tile-count").textContent = items.length
      tile.querySelector(".tile-detail").textContent = detail(items)
      return tile
    })

    target.replaceChildren(...tiles)
  } catch (err) {
    error.textContent = err.message
    error.classList.remove("d-none")
  } finally {
    loading.classList.add("d-none")
  }
}

document.querySelector("#dashboard-reload").addEventListener("click", loadDashboard)
loadDashboard()
