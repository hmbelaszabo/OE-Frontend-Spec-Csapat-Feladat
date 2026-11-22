"use strict"

import { formatBudget } from "./mission-utils.js"

/** @typedef {import("./mission.js").Mission} Mission */

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
   * @param {Function} bulkFunction - Tömeges módosítás.
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
      if (confirm("Biztosan visszaállítod az összes küldetést a kezdőállapotra?")) {
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
   * A rakéta lenyíló lista feltöltése a lookup adataiból.
   *
   * @param {{ id: string, name: string }[]} rocketOptions - A rakéták listája.
   * @returns {void}
   */
  fillRocketSelect(rocketOptions) {
    const select = document.querySelector("#field-rocketId")
    select.replaceChildren()

    for (const rocket of rocketOptions) {
      const option = document.createElement("option")
      option.value = rocket.id
      option.textContent = rocket.name
      select.appendChild(option)
    }
  }

  /**
   * A modal űrlapmezőinek kiolvasása, a megfelelő típusokra alakítva.
   *
   * @returns {Object} Az űrlapból összegyűjtött küldetés-adatok.
   */
  readForm() {
    const value = (id) => document.querySelector(id).value

    return {
      id: value("#field-id"),
      name: value("#field-name").trim(),
      rocketId: value("#field-rocketId"),
      budget: Number(value("#field-budget")),
      durationDays: Number(value("#field-durationDays")),
      launchDate: value("#field-launchDate"),
      successful: document.querySelector("#field-successful").checked,
      objectives: value("#field-objectives")
        .split(",")
        .map((objective) => objective.trim())
        .filter(Boolean)
    }
  }

  /**
   * Üres modal megnyitása új küldetés létrehozásához.
   *
   * @returns {void}
   */
  openEmptyForm() {
    document.querySelector("#edit-form").reset()
    document.querySelector("#field-id").value = ""
    document.querySelector("#modal-title").textContent = "Új küldetés"
    document.querySelector("#modal-error").classList.add("d-none")
    document.querySelector("#add-btn").classList.remove("d-none")
    document.querySelector("#update-btn").classList.add("d-none")

    bootstrap.Modal.getOrCreateInstance(document.querySelector("#edit-modal")).show()
  }

  /**
   * A modal kitöltése a kiválasztott küldetés adataival, majd megnyitása szerkesztésre.
   *
   * @param {Mission} mission - A szerkesztendő küldetés.
   * @returns {void}
   */
  fillForm(mission) {
    const fields = {
      "#field-id": mission.id,
      "#field-name": mission.name,
      "#field-rocketId": mission.rocketId,
      "#field-budget": mission.budget,
      "#field-durationDays": mission.durationDays,
      "#field-launchDate": mission.launchDate,
      "#field-objectives": mission.objectives.join(", ")
    }

    for (const [selector, value] of Object.entries(fields)) {
      document.querySelector(selector).value = value ?? ""
    }
    document.querySelector("#field-successful").checked = mission.successful

    document.querySelector("#modal-title").textContent = "Küldetés szerkesztése"
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
   * @param {number} totalBudget - Az összes költségvetés (millió $).
   * @param {Mission|null} longestMission - A leghosszabb küldetés.
   * @param {boolean} hasFailed - Volt-e sikertelen küldetés a már elindultak között.
   * @returns {void}
   */
  renderStatistics(totalBudget, longestMission, hasFailed) {
    document.querySelector("#stat-total-budget").textContent = formatBudget(totalBudget)

    document.querySelector("#stat-longest").textContent =
      longestMission
        ? `${longestMission.name} (${longestMission.durationDays} nap)`
        : "–"

    const failed = document.querySelector("#stat-has-failed")
    failed.textContent = hasFailed ? "Igen" : "Nem"
    failed.className = hasFailed ? "stat-value text-danger" : "stat-value text-success"
  }

  /**
   * A küldetések kirajzolása Bootstrap-kártyákként a <template> klónozásával.
   * Üres listánál a „Nincs megjeleníthető küldetés.” üzenet látszik.
   *
   * @param {Mission[]} missionArray - A megjelenítendő (már rendezett) küldetések.
   * @param {{ id: string, name: string }[]} rocketOptions - A rakéták listája a nevek kikereséséhez.
   * @param {Function} deleteFunction - Törlés id alapján.
   * @param {Function} selectForUpdateFunction - Szerkesztésre kiválasztás id alapján.
   * @returns {void}
   */
  render(missionArray, rocketOptions, deleteFunction, selectForUpdateFunction) {
    const target = document.querySelector("#target")
    const template = document.querySelector("#card-template")
    const fragment = document.createDocumentFragment()

    document
      .querySelector("#empty-message")
      .classList.toggle("d-none", missionArray.length > 0)

    for (const mission of missionArray) {
      const card = template.content.cloneNode(true)

      const rocket = rocketOptions.find((r) => r.id === mission.rocketId)
      card.querySelector(".mission-rocket").textContent = rocket ? rocket.name : "ismeretlen rakéta"

      const status = card.querySelector(".mission-status")
      status.textContent = mission.successful ? "Sikeres" : "Nem sikeres / tervezett"
      status.classList.add(mission.successful ? "text-bg-success" : "text-bg-secondary")

      card.querySelector(".mission-name").textContent = mission.name
      card.querySelector(".mission-budget").textContent = formatBudget(mission.budget)
      card.querySelector(".mission-duration").textContent = `${mission.durationDays} nap`
      card.querySelector(".mission-launch").textContent = mission.launchDate

      const objectives = card.querySelector(".mission-objectives")

      for (const objective of mission.objectives ?? []) {
        const badge = document.createElement("span")
        badge.className = "badge rounded-pill text-bg-light border"
        badge.textContent = objective
        objectives.appendChild(badge)
      }

      card
        .querySelector(".edit-button")
        .addEventListener("click", () => selectForUpdateFunction(mission.id))

      card
        .querySelector(".delete-button")
        .addEventListener("click", () => {
          if (confirm(`Biztosan törlöd: ${mission.name}?`)) {
            deleteFunction(mission.id)
          }
        })

      fragment.appendChild(card)
    }

    target.replaceChildren(fragment)
  }

  /**
   * Bónusz: a három kategória listájának kirajzolása.
   *
   * @param {{ small: Mission[], medium: Mission[], large: Mission[] }} categories - A kategóriák.
   * @returns {void}
   */
  renderCategories(categories) {
    for (const [key, missions] of Object.entries(categories)) {
      const list = document.querySelector(`#category-${key}`)
      list.replaceChildren()

      for (const mission of missions) {
        const li = document.createElement("li")
        li.className = "list-group-item"
        li.textContent = mission.name
        list.appendChild(li)
      }
    }
  }
}
