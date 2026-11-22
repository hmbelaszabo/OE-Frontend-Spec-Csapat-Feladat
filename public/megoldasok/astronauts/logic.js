"use strict"

import { API_BASE } from "../../shared/config.js"
import { Astronaut } from "./astronaut.js"
import { categorizeAstronauts, sortAstronauts } from "./astronaut-utils.js"

/**
 * Üzleti logika: adatok, API-hívások, statisztika. A DOM-hoz nem nyúl,
 * minden megjelenítést a Renderer végez.
 */
export class Logic {
  getApiUrl = `${API_BASE}/astronauts/getAstronauts`
  createApiUrl = `${API_BASE}/astronauts/createAstronaut`
  updateApiUrl = `${API_BASE}/astronauts/updateAstronaut`
  deleteApiUrl = `${API_BASE}/astronauts/deleteAstronaut`
  resetApiUrl = `${API_BASE}/astronauts/reset`
  missionOptionsApiUrl = `${API_BASE}/astronauts/getMissionOptions`

  astronauts = []
  missionOptions = []
  avgFlightHours = 0
  sortOrder = localStorage.getItem("astronauts-sort") ?? "name-asc"

  /**
   * Inicializálja az üzleti logikát a kapott Renderer-példánnyal, és beköti az eseményeket.
   *
   * @param {Renderer} renderer - A DOM-műveletekért felelős Renderer.
   */
  constructor(renderer) {
    this.renderer = renderer

    this.renderer.bindEvents(
      () => this.addAstronaut(),
      () => this.updateAstronaut(),
      () => this.addHoursToAssignedAstronauts(),
      () => this.loadDataWithThen(),
      () => this.resetData(),
      (sortOrder) => this.changeSortOrder(sortOrder)
    )
    this.renderer.setSortValue(this.sortOrder)
  }

  /**
   * Lekéri az asztronautákat és a küldetés-lookupot párhuzamosan (Promise.all),
   * és feltölti a helyi tömböket.
   *
   * @returns {Promise<void>}
   * @throws {Error} Ha bármelyik kérés sikertelen.
   */
  async loadData() {
    const [astronautResponse, missionResponse] = await Promise.all([
      fetch(this.getApiUrl),
      fetch(this.missionOptionsApiUrl)
    ])

    if (!astronautResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${astronautResponse.status})`)
    }
    if (!missionResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${missionResponse.status})`)
    }

    const data = await astronautResponse.json()
    this.missionOptions = await missionResponse.json()
    console.log("GET API response:", data)

    this.astronauts = data.map((item) => Object.assign(new Astronaut(), item))
    this.renderer.fillMissionSelect(this.missionOptions)
  }

  /**
   * Csak az asztronauták listáját tölti újra, .then() lánccal (Újratöltés gomb).
   *
   * @returns {void}
   */
  loadDataWithThen() {
    this.renderer.showLoading(true)

    fetch(this.getApiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${response.status})`)
        }
        return response.json()
      })
      .then((data) => {
        this.astronauts = data.map((item) => Object.assign(new Astronaut(), item))
        this.renderer.showLoading(false)
        this.displayData()
      })
      .catch((error) => {
        console.error("Nem sikerült újratölteni:", error)
        this.renderer.showLoading(false)
        this.renderer.showError(error.message)
      })
  }

  /**
   * Kiszámolja a statisztikákat, és a megjelenítést a Renderernek adja át.
   *
   * @returns {void}
   */
  displayData() {
    this.avgFlightHours = this.#calculateAverageFlightHours()
    const mostExperiencedAstronaut = this.#findMostExperiencedAstronaut()
    const hasPilot = this.#checkHasPilot()

    this.renderer.hideError()
    this.renderer.renderStatistics(this.avgFlightHours, mostExperiencedAstronaut, hasPilot)

    this.renderer.render(
      sortAstronauts(this.astronauts, this.sortOrder),
      this.missionOptions,
      this.#deleteAstronaut.bind(this),
      this.#selectAstronautForUpdate.bind(this)
    )

    this.renderer.renderCategories(categorizeAstronauts(this.astronauts))
  }

  /**
   * Új asztronautát hoz létre a Renderertől kapott űrlapadatokból.
   * GUID-ot generál, POST kérést küld, és csak sikeres válasz után bővíti a helyi tömböt.
   *
   * @returns {Promise<void>}
   */
  async addAstronaut() {
    const formData = this.renderer.readForm()

    const newAstronaut = Object.assign(new Astronaut(), formData, {
      id: this.#generateGuid()
    })

    try {
      await this.#sendRequest(this.createApiUrl, "POST", newAstronaut)

      this.astronauts.push(newAstronaut)
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült létrehozni:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Módosít egy meglévő asztronautát az id-ja alapján.
   * PUT kérést küld, és csak sikeres válasz után cseréli a helyi tömb elemét.
   *
   * @returns {Promise<void>}
   */
  async updateAstronaut() {
    const formData = this.renderer.readForm()

    const index = this.astronauts.findIndex(
      (astronaut) => astronaut.id === formData.id
    )

    if (index === -1) return

    const updatedAstronaut = Object.assign(new Astronaut(), formData)

    try {
      await this.#sendRequest(this.updateApiUrl, "PUT", updatedAstronaut)

      this.astronauts[index] = updatedAstronaut
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült módosítani:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Tömeges módosítás: minden küldetésre beosztott asztronauta repült órája +100.
   * A PUT kérések párhuzamosan mennek ki (Promise.all), utána újratöltjük az adatokat.
   *
   * @returns {Promise<void>}
   */
  async addHoursToAssignedAstronauts() {
    const updatedAstronauts = this.astronauts
      .filter((astronaut) => astronaut.missionId !== null)
      .map((astronaut) =>
        Object.assign(new Astronaut(), astronaut, {
          flightHours: astronaut.flightHours + 100
        })
      )

    try {
      await Promise.all(
        updatedAstronauts.map((astronaut) =>
          this.#sendRequest(this.updateApiUrl, "PUT", astronaut)
        )
      )

      await this.loadData()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült a tömeges módosítás:", error)
      this.renderer.showError(error.message)
    }
  }

  /**
   * Visszaállítja a szerveren a kezdő adatokat, majd újratölti őket.
   *
   * @returns {Promise<void>}
   */
  async resetData() {
    try {
      await this.#sendRequest(this.resetApiUrl, "POST", {})

      await this.loadData()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült visszaállítani:", error)
      this.renderer.showError(error.message)
    }
  }

  /**
   * Elmenti a választott rendezést a localStorage-be, és újrarajzolja a listát.
   *
   * @param {string} sortOrder - A rendező választó értéke.
   * @returns {void}
   */
  changeSortOrder(sortOrder) {
    this.sortOrder = sortOrder
    localStorage.setItem("astronauts-sort", sortOrder)
    this.displayData()
  }

  /**
   * Töröl egy asztronautát az id-ja alapján; a helyi tömbből csak sikeres válasz után veszi ki.
   *
   * @param {string} astronautId - Az asztronauta azonosítója.
   * @returns {Promise<void>}
   */
  async #deleteAstronaut(astronautId) {
    const index = this.astronauts.findIndex(
      (astronaut) => astronaut.id === astronautId
    )

    if (index === -1) return

    try {
      await this.#sendRequest(this.deleteApiUrl, "DELETE", { id: astronautId })

      this.astronauts.splice(index, 1)
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült törölni:", error)
      this.renderer.showError(error.message)
    }
  }

  /**
   * Kikeresi az asztronautát id alapján, és az űrlap kitöltését a Renderernek adja át.
   *
   * @param {string} astronautId - Az asztronauta azonosítója.
   * @returns {void}
   */
  #selectAstronautForUpdate(astronautId) {
    const astronaut = this.astronauts.find(
      (astronaut) => astronaut.id === astronautId
    )

    if (astronaut) {
      this.renderer.fillForm(astronaut)
    }
  }

  /**
   * Kiszámolja az átlagos repült órát.
   *
   * @returns {number} Egészre kerekített átlag, üres tömbnél 0.
   */
  #calculateAverageFlightHours() {
    if (this.astronauts.length === 0) return 0

    const sum = this.astronauts.reduce(
      (total, astronaut) => total + astronaut.flightHours,
      0
    )

    return Math.round(sum / this.astronauts.length)
  }

  /**
   * Megkeresi a legtöbb repült órával rendelkező asztronautát (egyezésnél az elsőt).
   *
   * @returns {Astronaut|null} A legtapasztaltabb asztronauta, üres tömbnél null.
   */
  #findMostExperiencedAstronaut() {
    return this.astronauts.reduce((most, astronaut) => {
      if (!most || astronaut.flightHours > most.flightHours) {
        return astronaut
      }

      return most
    }, null)
  }

  /**
   * Megvizsgálja, van-e legalább egy „pilóta” képességű asztronauta.
   *
   * @returns {boolean}
   */
  #checkHasPilot() {
    return this.astronauts.some((astronaut) => astronaut.skills.includes("pilóta"))
  }

  /**
   * HTTP-kérést küld a megadott végpontra JSON-törzzsel.
   *
   * @param {string} url - A végpont URL-je.
   * @param {string} method - HTTP-metódus (POST, PUT, DELETE).
   * @param {Object} body - A kérés törzse.
   * @returns {Promise<any>} A feldolgozott válasz, üres válasznál null.
   * @throws {Error} Ha a kérés sikertelen (a státuszkóddal).
   */
  async #sendRequest(url, method, body) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`${method} hiba: HTTP ${response.status}`)
    }

    const responseText = await response.text()
    let data = null

    if (responseText) {
      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }
    }

    console.log(`${method} API response:`, data)

    return data
  }

  /**
   * Véletlen, UUID v4 formátumú azonosítót generál.
   *
   * @returns {string} A generált GUID.
   */
  #generateGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === "x" ? r : (r & 0x3) | 0x8

        return v.toString(16)
      }
    )
  }
}
