"use strict"

import { formatNumber } from "./satellite-utils.js"

/** @typedef {import("./satellite.js").Satellite} Satellite */

/**
 * Minden DOM-művelet itt történik. A Renderer nem hív fetch-et, és nem tárol adatot.
 */
export class Renderer {
  /**
   * Eseménykezelők bekötése a gombokra és a rendező választóra.
   * A műveleteket a Logic-tól kapott callback-függvények végzik.
   *
   * @param {Function} createFunction - Létrehozás (modal „Létrehozás” gombja).
   * @param {Function} updateFunction - Módosítás (modal „Módosítás” gombja).
   * @param {Function} bulkFunction - Tömeges módosítás (régiek leállítása).
   * @param {Function} reloadFunction - Újratöltés.
   * @param {Function} resetFunction - Adatok visszaállítása.
   * @param {Function} sortFunction - Rendezés; paraméterként a választott értéket kapja.
   * @returns {void}
   */
  bindEvents(createFunction, updateFunction, bulkFunction, reloadFunction, resetFunction, sortFunction) {
    document.querySelector("#new-btn").addEventListener("click", () => this.openEmptyForm())
    document.querySelector("#add-btn").addEventListener("click", createFunction)
    document.querySelector("#update-btn").addEventListener("click", updateFunction)
    document.querySelector("#reload-btn").addEventListener("click", reloadFunction)

    document.querySelector("#bulk-btn").addEventListener("click", () => {
      if (confirm("Biztosan leállítod az összes 15 évnél régebbi műholdat?")) {
        bulkFunction()
      }
    })

    document.querySelector("#reset-btn").addEventListener("click", () => {
      if (confirm("Biztosan visszaállítod az összes műholdat a kezdőállapotra?")) {
        resetFunction()
      }
    })

    document
      .querySelector("#sort-select")
      .addEventListener("change", (event) => sortFunction(event.target.value))
  }

  /**
   * Beállítja a rendező választó értékét (pl. a localStorage-ből visszatöltve).
   *
   * @param {string} sortOrder - A választó egyik értéke.
   * @returns {void}
   */
  setSortValue(sortOrder) {
    document.querySelector("#sort-select").value = sortOrder
  }

  /**
   * A spinner megjelenítése vagy elrejtése.
   *
   * @param {boolean} isLoading - Betöltés folyamatban van-e.
   * @returns {void}
   */
  showLoading(isLoading) {
    document.querySelector("#loading").classList.toggle("d-none", !isLoading)
  }

  /**
   * Hibaüzenet megjelenítése az oldal tetején.
   *
   * @param {string} message - A hibaüzenet.
   * @returns {void}
   */
  showError(message) {
    const alert = document.querySelector("#error-alert")
    alert.textContent = message
    alert.classList.remove("d-none")
  }

  /**
   * Az oldal tetején lévő hibaüzenet elrejtése.
   *
   * @returns {void}
   */
  hideError() {
    document.querySelector("#error-alert").classList.add("d-none")
  }

  /**
   * Hibaüzenet megjelenítése a modalon belül.
   *
   * @param {string} message - A hibaüzenet.
   * @returns {void}
   */
  showFormError(message) {
    const alert = document.querySelector("#modal-error")
    alert.textContent = message
    alert.classList.remove("d-none")
  }

  /**
   * Az égitest lenyíló lista feltöltése a lookup adataiból.
   *
   * @param {{ id: string, name: string }[]} targetOptions - Az égitestek listája.
   * @returns {void}
   */
  fillTargetSelect(targetOptions) {
    const select = document.querySelector("#field-targetId")
    select.replaceChildren()

    for (const target of targetOptions) {
      const option = document.createElement("option")
      option.value = target.id
      option.textContent = target.name
      select.appendChild(option)
    }
  }

  /**
   * A modal űrlapmezőinek kiolvasása, a megfelelő típusokra alakítva.
   *
   * @returns {Object} Az űrlapból összegyűjtött műhold-adatok.
   */
  readForm() {
    const value = (id) => document.querySelector(id).value

    return {
      id: value("#field-id"),
      name: value("#field-name").trim(),
      targetId: value("#field-targetId"),
      altitudeKm: Number(value("#field-altitudeKm")),
      massKg: Number(value("#field-massKg")),
      launchYear: Number(value("#field-launchYear")),
      operational: document.querySelector("#field-operational").checked,
      instruments: value("#field-instruments")
        .split(",")
        .map((instrument) => instrument.trim())
        .filter(Boolean)
    }
  }

  /**
   * Üres modal megnyitása új műhold létrehozásához (a „Működik” kapcsoló alapból bekapcsolva).
   *
   * @returns {void}
   */
  openEmptyForm() {
    document.querySelector("#edit-form").reset()
    document.querySelector("#field-id").value = ""
    document.querySelector("#field-operational").checked = true
    document.querySelector("#modal-title").textContent = "Új műhold"
    document.querySelector("#modal-error").classList.add("d-none")
    document.querySelector("#add-btn").classList.remove("d-none")
    document.querySelector("#update-btn").classList.add("d-none")

    bootstrap.Modal.getOrCreateInstance(document.querySelector("#edit-modal")).show()
  }

  /**
   * A modal kitöltése a kiválasztott műhold adataival, majd megnyitása szerkesztésre.
   *
   * @param {Satellite} satellite - A szerkesztendő műhold.
   * @returns {void}
   */
  fillForm(satellite) {
    const fields = {
      "#field-id": satellite.id,
      "#field-name": satellite.name,
      "#field-targetId": satellite.targetId,
      "#field-altitudeKm": satellite.altitudeKm,
      "#field-massKg": satellite.massKg,
      "#field-launchYear": satellite.launchYear,
      "#field-instruments": satellite.instruments.join(", ")
    }

    for (const [selector, value] of Object.entries(fields)) {
      document.querySelector(selector).value = value ?? ""
    }
    document.querySelector("#field-operational").checked = satellite.operational

    document.querySelector("#modal-title").textContent = "Műhold szerkesztése"
    document.querySelector("#modal-error").classList.add("d-none")
    document.querySelector("#add-btn").classList.add("d-none")
    document.querySelector("#update-btn").classList.remove("d-none")

    bootstrap.Modal.getOrCreateInstance(document.querySelector("#edit-modal")).show()
  }

  /**
   * Az űrlap ürítése és a modal bezárása (sikeres mentés után).
   *
   * @returns {void}
   */
  clearForm() {
    document.querySelector("#edit-form").reset()
    document.querySelector("#field-id").value = ""

    bootstrap.Modal.getOrCreateInstance(document.querySelector("#edit-modal")).hide()
  }

  /**
   * A Logic által kiszámolt statisztikák megjelenítése.
   *
   * @param {number} operationalRatio - A működő műholdak aránya (%).
   * @param {number} totalMass - Össztömeg kilogrammban.
   * @param {Satellite|null} oldestSatellite - A legkorábban indított műhold.
   * @returns {void}
   */
  renderStatistics(operationalRatio, totalMass, oldestSatellite) {
    document.querySelector("#stat-operational-ratio").textContent = `${operationalRatio}%`

    document.querySelector("#stat-total-mass").textContent =
      `${formatNumber(totalMass)} kg (${formatNumber(totalMass / 1000)} t)`

    document.querySelector("#stat-oldest").textContent = oldestSatellite
      ? `${oldestSatellite.name} (${oldestSatellite.launchYear})`
      : "–"
  }

  /**
   * A műholdak kirajzolása Bootstrap-kártyákként a <template> klónozásával.
   * Üres listánál a „Nincs megjeleníthető műhold.” üzenet látszik.
   *
   * @param {Satellite[]} satelliteArray - A megjelenítendő (már rendezett) műholdak.
   * @param {{ id: string, name: string }[]} targetOptions - Az égitestek listája a nevek kikereséséhez.
   * @param {Function} deleteFunction - Törlés id alapján.
   * @param {Function} selectForUpdateFunction - Szerkesztésre kiválasztás id alapján.
   * @returns {void}
   */
  render(satelliteArray, targetOptions, deleteFunction, selectForUpdateFunction) {
    const target = document.querySelector("#target")
    const template = document.querySelector("#card-template")
    const fragment = document.createDocumentFragment()

    document
      .querySelector("#empty-message")
      .classList.toggle("d-none", satelliteArray.length > 0)

    for (const satellite of satelliteArray) {
      const card = template.content.cloneNode(true)

      const body = targetOptions.find((t) => t.id === satellite.targetId)
      card.querySelector(".satellite-target").textContent = body ? body.name : "ismeretlen égitest"

      const status = card.querySelector(".satellite-status")
      status.textContent = satellite.operational ? "működik" : "leállt"
      status.classList.add(satellite.operational ? "text-bg-success" : "text-bg-secondary")

      card.querySelector(".satellite-name").textContent = satellite.name
      card.querySelector(".satellite-altitude").textContent = `${formatNumber(satellite.altitudeKm)} km`
      card.querySelector(".satellite-mass").textContent = `${formatNumber(satellite.massKg)} kg`
      card.querySelector(".satellite-year").textContent = satellite.launchYear

      const instruments = card.querySelector(".satellite-instruments")

      for (const instrument of satellite.instruments ?? []) {
        const badge = document.createElement("span")
        badge.className = "badge rounded-pill text-bg-light border"
        badge.textContent = instrument
        instruments.appendChild(badge)
      }

      card
        .querySelector(".edit-button")
        .addEventListener("click", () => selectForUpdateFunction(satellite.id))

      card
        .querySelector(".delete-button")
        .addEventListener("click", () => {
          if (confirm(`Biztosan törlöd: ${satellite.name}?`)) {
            deleteFunction(satellite.id)
          }
        })

      fragment.appendChild(card)
    }

    target.replaceChildren(fragment)
  }

  /**
   * Bónusz: a három kategória listájának kirajzolása.
   *
   * @param {{ leo: Satellite[], meo: Satellite[], geo: Satellite[] }} categories - A kategóriák.
   * @returns {void}
   */
  renderCategories(categories) {
    for (const [key, satellites] of Object.entries(categories)) {
      const list = document.querySelector(`#category-${key}`)
      list.replaceChildren()

      for (const satellite of satellites) {
        const li = document.createElement("li")
        li.className = "list-group-item"
        li.textContent = satellite.name
        list.appendChild(li)
      }
    }
  }
}
