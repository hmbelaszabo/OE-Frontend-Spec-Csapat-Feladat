"use strict"

import { typeLabel } from "./target-utils.js"

/** @typedef {import("./target.js").Target} Target */
/** @typedef {{ id: string, targetId: string, mission: string, year: number }} Visit */

/** A típus-badge színe típusonként. */
const TYPE_BADGES = { planet: "text-bg-primary", moon: "text-bg-info", asteroid: "text-bg-warning" }

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
   * @param {Function} bulkFunction - Tömeges módosítás (lakhatóság újraértékelése).
   * @param {Function} reloadFunction - Újratöltés.
   * @param {Function} resetFunction - Adatok visszaállítása.
   * @param {Function} sortFunction - Rendezés; paraméterként a választott értéket kapja.
   * @returns {void}
   */
  bindEvents(createFunction, updateFunction, bulkFunction, reloadFunction, resetFunction, sortFunction) {
    document.querySelector("#new-btn").addEventListener("click", () => this.openEmptyForm())
    document.querySelector("#add-btn").addEventListener("click", createFunction)
    document.querySelector("#update-btn").addEventListener("click", updateFunction)
    document.querySelector("#bulk-btn").addEventListener("click", bulkFunction)
    document.querySelector("#reload-btn").addEventListener("click", reloadFunction)

    document.querySelector("#reset-btn").addEventListener("click", () => {
      if (confirm("Biztosan visszaállítod az összes célpontot a kezdőállapotra?")) {
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
   * A modal űrlapmezőinek kiolvasása, a megfelelő típusokra alakítva.
   *
   * @returns {Object} Az űrlapból összegyűjtött célpont-adatok.
   */
  readForm() {
    const value = (id) => document.querySelector(id).value

    return {
      id: value("#field-id"),
      name: value("#field-name").trim(),
      type: value("#field-type"),
      distanceMkm: Number(value("#field-distanceMkm")),
      avgTempC: Number(value("#field-avgTempC")),
      habitable: document.querySelector("#field-habitable").checked,
      moons: Number(value("#field-moons")),
      gravity: Number(value("#field-gravity"))
    }
  }

  /**
   * Üres modal megnyitása új célpont létrehozásához.
   *
   * @returns {void}
   */
  openEmptyForm() {
    document.querySelector("#edit-form").reset()
    document.querySelector("#field-id").value = ""
    document.querySelector("#modal-title").textContent = "Új célpont"
    document.querySelector("#modal-error").classList.add("d-none")
    document.querySelector("#add-btn").classList.remove("d-none")
    document.querySelector("#update-btn").classList.add("d-none")

    bootstrap.Modal.getOrCreateInstance(document.querySelector("#edit-modal")).show()
  }

  /**
   * A modal kitöltése a kiválasztott célpont adataival, majd megnyitása szerkesztésre.
   *
   * @param {Target} target - A szerkesztendő célpont.
   * @returns {void}
   */
  fillForm(target) {
    const fields = {
      "#field-id": target.id,
      "#field-name": target.name,
      "#field-type": target.type,
      "#field-distanceMkm": target.distanceMkm,
      "#field-avgTempC": target.avgTempC,
      "#field-moons": target.moons,
      "#field-gravity": target.gravity
    }

    for (const [selector, value] of Object.entries(fields)) {
      document.querySelector(selector).value = value ?? ""
    }
    document.querySelector("#field-habitable").checked = target.habitable

    document.querySelector("#modal-title").textContent = "Célpont szerkesztése"
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
   * @param {Target|null} closestTarget - A Földhöz legközelebbi célpont.
   * @param {number} avgTemperature - Átlaghőmérséklet (°C).
   * @param {boolean} hasHabitable - Van-e lakható célpont.
   * @returns {void}
   */
  renderStatistics(closestTarget, avgTemperature, hasHabitable) {
    document.querySelector("#stat-closest").textContent =
      closestTarget
        ? `${closestTarget.name} (${closestTarget.distanceMkm.toLocaleString("hu-HU")} M km)`
        : "–"

    document.querySelector("#stat-avg-temp").textContent =
      `${avgTemperature.toLocaleString("hu-HU")} °C`

    const habitable = document.querySelector("#stat-has-habitable")
    habitable.textContent = hasHabitable ? "Igen" : "Nem"
    habitable.className = hasHabitable ? "stat-value text-success" : "stat-value text-danger"
  }

  /**
   * A célpontok kirajzolása Bootstrap-kártyákként a <template> klónozásával.
   * Üres listánál a „Nincs megjeleníthető célpont.” üzenet látszik.
   *
   * @param {Target[]} targetArray - A megjelenítendő (már rendezett) célpontok.
   * @param {Visit[]} visits - A látogatások listája (lookup).
   * @param {Function} deleteFunction - Törlés id alapján.
   * @param {Function} selectForUpdateFunction - Szerkesztésre kiválasztás id alapján.
   * @returns {void}
   */
  render(targetArray, visits, deleteFunction, selectForUpdateFunction) {
    const container = document.querySelector("#target")
    const template = document.querySelector("#card-template")
    const fragment = document.createDocumentFragment()

    document
      .querySelector("#empty-message")
      .classList.toggle("d-none", targetArray.length > 0)

    for (const target of targetArray) {
      const card = template.content.cloneNode(true)

      const type = card.querySelector(".target-type")
      type.textContent = typeLabel(target.type)
      type.className = `badge ${TYPE_BADGES[target.type] ?? "text-bg-secondary"}`

      const habitable = card.querySelector(".target-habitable")
      habitable.textContent = target.habitable ? "Lakható" : "Nem lakható"
      habitable.classList.add(target.habitable ? "text-bg-success" : "text-bg-secondary")

      card.querySelector(".target-name").textContent = target.name
      card.querySelector(".target-distance").textContent =
        `${target.distanceMkm.toLocaleString("hu-HU")} millió km`
      card.querySelector(".target-temp").textContent = `${target.avgTempC} °C`
      card.querySelector(".target-moons").textContent = target.moons
      card.querySelector(".target-gravity").textContent = `${target.gravity} g`

      const targetVisits = visits.filter((visit) => visit.targetId === target.id)
      const latestVisit = targetVisits.reduce(
        (latest, visit) => (!latest || visit.year > latest.year ? visit : latest),
        null
      )
      card.querySelector(".target-visits").textContent = latestVisit
        ? `${targetVisits.length} (legutóbb: ${latestVisit.mission}, ${latestVisit.year})`
        : "még nem járt ott küldetés"

      card
        .querySelector(".edit-button")
        .addEventListener("click", () => selectForUpdateFunction(target.id))

      card
        .querySelector(".delete-button")
        .addEventListener("click", () => {
          if (confirm(`Biztosan törlöd: ${target.name}?`)) {
            deleteFunction(target.id)
          }
        })

      fragment.appendChild(card)
    }

    container.replaceChildren(fragment)
  }

  /**
   * Bónusz: a három kategória listájának kirajzolása.
   *
   * @param {{ planet: Target[], moon: Target[], asteroid: Target[] }} categories - A kategóriák.
   * @returns {void}
   */
  renderCategories(categories) {
    for (const [key, targets] of Object.entries(categories)) {
      const list = document.querySelector(`#category-${key}`)
      list.replaceChildren()

      for (const target of targets) {
        const li = document.createElement("li")
        li.className = "list-group-item"
        li.textContent = target.name
        list.appendChild(li)
      }
    }
  }
}
