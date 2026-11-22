"use strict"

import { formatCost } from "./rocket-utils.js"

/** @typedef {import("./rocket.js").Rocket} Rocket */

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
      if (confirm("Biztosan visszaállítod az összes rakétát a kezdőállapotra?")) {
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
   * @returns {Object} Az űrlapból összegyűjtött rakéta-adatok.
   */
  readForm() {
    const value = (id) => document.querySelector(id).value

    return {
      id: value("#field-id"),
      name: value("#field-name").trim(),
      manufacturer: value("#field-manufacturer").trim(),
      payloadTons: Number(value("#field-payloadTons")),
      stages: Number(value("#field-stages")),
      reusable: document.querySelector("#field-reusable").checked,
      costPerLaunch: Number(value("#field-costPerLaunch")),
      image: value("#field-image").trim()
    }
  }

  /**
   * Üres modal megnyitása új rakéta létrehozásához.
   *
   * @returns {void}
   */
  openEmptyForm() {
    document.querySelector("#edit-form").reset()
    document.querySelector("#field-id").value = ""
    document.querySelector("#modal-title").textContent = "Új rakéta"
    document.querySelector("#modal-error").classList.add("d-none")
    document.querySelector("#add-btn").classList.remove("d-none")
    document.querySelector("#update-btn").classList.add("d-none")

    bootstrap.Modal.getOrCreateInstance(document.querySelector("#edit-modal")).show()
  }

  /**
   * A modal kitöltése a kiválasztott rakéta adataival, majd megnyitása szerkesztésre.
   *
   * @param {Rocket} rocket - A szerkesztendő rakéta.
   * @returns {void}
   */
  fillForm(rocket) {
    const fields = {
      "#field-id": rocket.id,
      "#field-name": rocket.name,
      "#field-manufacturer": rocket.manufacturer,
      "#field-payloadTons": rocket.payloadTons,
      "#field-stages": rocket.stages,
      "#field-costPerLaunch": rocket.costPerLaunch,
      "#field-image": rocket.image
    }

    for (const [selector, value] of Object.entries(fields)) {
      document.querySelector(selector).value = value ?? ""
    }
    document.querySelector("#field-reusable").checked = rocket.reusable

    document.querySelector("#modal-title").textContent = "Rakéta szerkesztése"
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
   * @param {number} avgCost - Átlagos indítási költség (millió $).
   * @param {Rocket|null} heaviestPayloadRocket - A legnagyobb teherbírású rakéta.
   * @param {boolean} allReusable - Minden rakéta újrahasznosítható-e.
   * @returns {void}
   */
  renderStatistics(avgCost, heaviestPayloadRocket, allReusable) {
    document.querySelector("#stat-avg-cost").textContent = formatCost(avgCost)

    document.querySelector("#stat-max-payload").textContent =
      heaviestPayloadRocket
        ? `${heaviestPayloadRocket.name} (${heaviestPayloadRocket.payloadTons} t)`
        : "–"

    const reusable = document.querySelector("#stat-all-reusable")
    reusable.textContent = allReusable ? "Igen" : "Nem"
    reusable.className = allReusable ? "stat-value text-success" : "stat-value text-danger"
  }

  /**
   * A rakéták kirajzolása Bootstrap-kártyákként a <template> klónozásával.
   * Üres listánál a „Nincs megjeleníthető rakéta.” üzenet látszik.
   *
   * @param {Rocket[]} rocketArray - A megjelenítendő (már rendezett) rakéták.
   * @param {{ id: string, rocketId: string, date: string, success: boolean }[]} launches - Az indítások listája.
   * @param {Function} deleteFunction - Törlés id alapján.
   * @param {Function} selectForUpdateFunction - Szerkesztésre kiválasztás id alapján.
   * @returns {void}
   */
  render(rocketArray, launches, deleteFunction, selectForUpdateFunction) {
    const target = document.querySelector("#target")
    const template = document.querySelector("#card-template")
    const fragment = document.createDocumentFragment()

    document
      .querySelector("#empty-message")
      .classList.toggle("d-none", rocketArray.length > 0)

    for (const rocket of rocketArray) {
      const card = template.content.cloneNode(true)

      card.querySelector(".rocket-manufacturer").textContent = rocket.manufacturer

      const badge = card.querySelector(".rocket-reusable")
      badge.textContent = rocket.reusable ? "Újrahasznosítható" : "Egyszer használatos"
      badge.classList.add(rocket.reusable ? "text-bg-success" : "text-bg-secondary")

      if (rocket.image) {
        const img = card.querySelector(".rocket-image")
        img.src = rocket.image
        img.alt = `${rocket.name} képe`
        img.classList.remove("d-none")
        card.querySelector(".rocket-placeholder").classList.remove("d-flex")
        card.querySelector(".rocket-placeholder").classList.add("d-none")
      }

      card.querySelector(".rocket-name").textContent = rocket.name
      card.querySelector(".rocket-payload").textContent = `${rocket.payloadTons} t`
      card.querySelector(".rocket-stages").textContent = rocket.stages
      card.querySelector(".rocket-cost").textContent = formatCost(rocket.costPerLaunch)

      const ownLaunches = launches.filter((launch) => launch.rocketId === rocket.id)
      const successfulLaunches = ownLaunches.filter((launch) => launch.success)
      card.querySelector(".rocket-launches").textContent =
        ownLaunches.length === 0
          ? "nincs adat"
          : `${ownLaunches.length} db, ${Math.round((successfulLaunches.length / ownLaunches.length) * 100)}% sikeres`

      card
        .querySelector(".edit-button")
        .addEventListener("click", () => selectForUpdateFunction(rocket.id))

      card
        .querySelector(".delete-button")
        .addEventListener("click", () => {
          if (confirm(`Biztosan törlöd: ${rocket.name}?`)) {
            deleteFunction(rocket.id)
          }
        })

      fragment.appendChild(card)
    }

    target.replaceChildren(fragment)
  }

  /**
   * Bónusz: a három kategória listájának kirajzolása.
   *
   * @param {{ light: Rocket[], medium: Rocket[], heavy: Rocket[] }} categories - A kategóriák.
   * @returns {void}
   */
  renderCategories(categories) {
    for (const [key, rockets] of Object.entries(categories)) {
      const list = document.querySelector(`#category-${key}`)
      list.replaceChildren()

      for (const rocket of rockets) {
        const li = document.createElement("li")
        li.className = "list-group-item"
        li.textContent = rocket.name
        list.appendChild(li)
      }
    }
  }
}
