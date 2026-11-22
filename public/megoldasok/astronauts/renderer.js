"use strict"

import { formatHours } from "./astronaut-utils.js"

/** @typedef {import("./astronaut.js").Astronaut} Astronaut */

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
      if (confirm("Biztosan visszaállítod az összes asztronautát a kezdőállapotra?")) {
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
   * A küldetés lenyíló lista feltöltése a lookup adataiból.
   * Az első, „nincs beosztva” opció fixen a HTML-ben van, azt megtartjuk.
   *
   * @param {{ id: string, name: string }[]} missionOptions - A küldetések listája.
   * @returns {void}
   */
  fillMissionSelect(missionOptions) {
    const select = document.querySelector("#field-missionId")
    const emptyOption = select.querySelector('option[value=""]')
    select.replaceChildren(emptyOption)

    for (const mission of missionOptions) {
      const option = document.createElement("option")
      option.value = mission.id
      option.textContent = mission.name
      select.appendChild(option)
    }
  }

  /**
   * A modal űrlapmezőinek kiolvasása, a megfelelő típusokra alakítva.
   *
   * @returns {Object} Az űrlapból összegyűjtött asztronauta-adatok.
   */
  readForm() {
    const value = (id) => document.querySelector(id).value

    return {
      id: value("#field-id"),
      name: value("#field-name").trim(),
      nationality: value("#field-nationality").trim(),
      age: Number(value("#field-age")),
      flightHours: Number(value("#field-flightHours")),
      isCommander: document.querySelector("#field-isCommander").checked,
      missionId: value("#field-missionId") || null,
      skills: value("#field-skills")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      image: value("#field-image").trim()
    }
  }

  /**
   * Üres modal megnyitása új asztronauta létrehozásához.
   *
   * @returns {void}
   */
  openEmptyForm() {
    document.querySelector("#edit-form").reset()
    document.querySelector("#field-id").value = ""
    document.querySelector("#modal-title").textContent = "Új asztronauta"
    document.querySelector("#modal-error").classList.add("d-none")
    document.querySelector("#add-btn").classList.remove("d-none")
    document.querySelector("#update-btn").classList.add("d-none")

    bootstrap.Modal.getOrCreateInstance(document.querySelector("#edit-modal")).show()
  }

  /**
   * A modal kitöltése a kiválasztott asztronauta adataival, majd megnyitása szerkesztésre.
   *
   * @param {Astronaut} astronaut - A szerkesztendő asztronauta.
   * @returns {void}
   */
  fillForm(astronaut) {
    const fields = {
      "#field-id": astronaut.id,
      "#field-name": astronaut.name,
      "#field-nationality": astronaut.nationality,
      "#field-age": astronaut.age,
      "#field-flightHours": astronaut.flightHours,
      "#field-missionId": astronaut.missionId ?? "",
      "#field-skills": astronaut.skills.join(", "),
      "#field-image": astronaut.image
    }

    for (const [selector, value] of Object.entries(fields)) {
      document.querySelector(selector).value = value ?? ""
    }
    document.querySelector("#field-isCommander").checked = astronaut.isCommander

    document.querySelector("#modal-title").textContent = "Asztronauta szerkesztése"
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
   * @param {number} avgFlightHours - Átlagos repült óra.
   * @param {Astronaut|null} mostExperiencedAstronaut - A legtöbb repült órával rendelkező asztronauta.
   * @param {boolean} hasPilot - Van-e pilóta képességű asztronauta.
   * @returns {void}
   */
  renderStatistics(avgFlightHours, mostExperiencedAstronaut, hasPilot) {
    document.querySelector("#stat-avg-hours").textContent = formatHours(avgFlightHours)

    document.querySelector("#stat-most-experienced").textContent =
      mostExperiencedAstronaut
        ? `${mostExperiencedAstronaut.name} (${formatHours(mostExperiencedAstronaut.flightHours)})`
        : "–"

    const pilot = document.querySelector("#stat-has-pilot")
    pilot.textContent = hasPilot ? "Igen" : "Nem"
    pilot.className = hasPilot ? "stat-value text-success" : "stat-value text-danger"
  }

  /**
   * Az asztronauták kirajzolása Bootstrap-kártyákként a <template> klónozásával.
   * Üres listánál a „Nincs megjeleníthető asztronauta.” üzenet látszik.
   *
   * @param {Astronaut[]} astronautArray - A megjelenítendő (már rendezett) asztronauták.
   * @param {{ id: string, name: string }[]} missionOptions - A küldetések listája a nevek kikereséséhez.
   * @param {Function} deleteFunction - Törlés id alapján.
   * @param {Function} selectForUpdateFunction - Szerkesztésre kiválasztás id alapján.
   * @returns {void}
   */
  render(astronautArray, missionOptions, deleteFunction, selectForUpdateFunction) {
    const target = document.querySelector("#target")
    const template = document.querySelector("#card-template")
    const fragment = document.createDocumentFragment()

    document
      .querySelector("#empty-message")
      .classList.toggle("d-none", astronautArray.length > 0)

    for (const astronaut of astronautArray) {
      const card = template.content.cloneNode(true)

      const mission = missionOptions.find((m) => m.id === astronaut.missionId)
      card.querySelector(".astronaut-mission").textContent = mission ? mission.name : "nincs beosztva"

      const commander = card.querySelector(".astronaut-commander")
      commander.textContent = astronaut.isCommander ? "Parancsnok" : "Legénységi tag"
      commander.classList.add(astronaut.isCommander ? "text-bg-success" : "text-bg-secondary")

      if (astronaut.image) {
        const img = card.querySelector(".astronaut-image")
        img.src = astronaut.image
        img.alt = `${astronaut.name} fényképe`
        img.classList.remove("d-none")
        card.querySelector(".astronaut-placeholder").classList.add("d-none")
      }

      card.querySelector(".astronaut-name").textContent = astronaut.name
      card.querySelector(".astronaut-nationality").textContent = astronaut.nationality
      card.querySelector(".astronaut-age").textContent = `${astronaut.age} év`
      card.querySelector(".astronaut-hours").textContent = formatHours(astronaut.flightHours)

      const skills = card.querySelector(".astronaut-skills")

      for (const skill of astronaut.skills ?? []) {
        const badge = document.createElement("span")
        badge.className = "badge rounded-pill text-bg-light border"
        badge.textContent = skill
        skills.appendChild(badge)
      }

      card
        .querySelector(".edit-button")
        .addEventListener("click", () => selectForUpdateFunction(astronaut.id))

      card
        .querySelector(".delete-button")
        .addEventListener("click", () => {
          if (confirm(`Biztosan törlöd: ${astronaut.name}?`)) {
            deleteFunction(astronaut.id)
          }
        })

      fragment.appendChild(card)
    }

    target.replaceChildren(fragment)
  }

  /**
   * Bónusz: a három kategória listájának kirajzolása.
   *
   * @param {{ rookie: Astronaut[], advanced: Astronaut[], veteran: Astronaut[] }} categories - A kategóriák.
   * @returns {void}
   */
  renderCategories(categories) {
    for (const [key, astronauts] of Object.entries(categories)) {
      const list = document.querySelector(`#category-${key}`)
      list.replaceChildren()

      for (const astronaut of astronauts) {
        const li = document.createElement("li")
        li.className = "list-group-item"
        li.textContent = astronaut.name
        list.appendChild(li)
      }
    }
  }
}
