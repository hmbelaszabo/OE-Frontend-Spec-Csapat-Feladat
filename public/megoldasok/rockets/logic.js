"use strict"

import { API_BASE } from "../../shared/config.js"
import { Rocket } from "./rocket.js"
import { categorizeRockets, sortRockets } from "./rocket-utils.js"

/**
 * Üzleti logika: adatok, API-hívások, statisztika. A DOM-hoz nem nyúl,
 * minden megjelenítést a Renderer végez.
 */
export class Logic {
  getApiUrl = `${API_BASE}/rockets/getRockets`
  createApiUrl = `${API_BASE}/rockets/createRocket`
  updateApiUrl = `${API_BASE}/rockets/updateRocket`
  deleteApiUrl = `${API_BASE}/rockets/deleteRocket`
  resetApiUrl = `${API_BASE}/rockets/reset`
  launchesApiUrl = `${API_BASE}/rockets/getLaunches`

  rockets = []
  launches = []
  avgCost = 0
  sortOrder = localStorage.getItem("rockets-sort") ?? "name-asc"

  /**
   * Inicializálja az üzleti logikát a kapott Renderer-példánnyal, és beköti az eseményeket.
   *
   * @param {Renderer} renderer - A DOM-műveletekért felelős Renderer.
   */
  constructor(renderer) {
    this.renderer = renderer

    this.renderer.bindEvents(
      () => this.addRocket(),
      () => this.updateRocket(),
      () => this.reduceReusableCosts(),
      () => this.loadDataWithThen(),
      () => this.resetData(),
      (sortOrder) => this.changeSortOrder(sortOrder)
    )
    this.renderer.setSortValue(this.sortOrder)
  }

  /**
   * Lekéri a rakétákat és az indítás-lookupot párhuzamosan (Promise.all),
   * és feltölti a helyi tömböket.
   *
   * @returns {Promise<void>}
   * @throws {Error} Ha bármelyik kérés sikertelen.
   */
  async loadData() {
    const [rocketResponse, launchResponse] = await Promise.all([
      fetch(this.getApiUrl),
      fetch(this.launchesApiUrl)
    ])

    if (!rocketResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${rocketResponse.status})`)
    }
    if (!launchResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${launchResponse.status})`)
    }

    const data = await rocketResponse.json()
    this.launches = await launchResponse.json()
    console.log("GET API response:", data)

    this.rockets = data.map((item) => Object.assign(new Rocket(), item))
  }

  /**
   * Csak a rakéták listáját tölti újra, .then() lánccal (Újratöltés gomb).
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
        this.rockets = data.map((item) => Object.assign(new Rocket(), item))
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
    this.avgCost = this.#calculateAverageCost()
    const heaviestPayloadRocket = this.#findHeaviestPayloadRocket()
    const allReusable = this.#checkAllReusable()

    this.renderer.hideError()
    this.renderer.renderStatistics(this.avgCost, heaviestPayloadRocket, allReusable)

    this.renderer.render(
      sortRockets(this.rockets, this.sortOrder),
      this.launches,
      this.#deleteRocket.bind(this),
      this.#selectRocketForUpdate.bind(this)
    )

    this.renderer.renderCategories(categorizeRockets(this.rockets))
  }

  /**
   * Új rakétát hoz létre a Renderertől kapott űrlapadatokból.
   * GUID-ot generál, POST kérést küld, és csak sikeres válasz után bővíti a helyi tömböt.
   *
   * @returns {Promise<void>}
   */
  async addRocket() {
    const formData = this.renderer.readForm()

    const newRocket = Object.assign(new Rocket(), formData, {
      id: this.#generateGuid()
    })

    try {
      await this.#sendRequest(this.createApiUrl, "POST", newRocket)

      this.rockets.push(newRocket)
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült létrehozni:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Módosít egy meglévő rakétát az id-ja alapján.
   * PUT kérést küld, és csak sikeres válasz után cseréli a helyi tömb elemét.
   *
   * @returns {Promise<void>}
   */
  async updateRocket() {
    const formData = this.renderer.readForm()

    const index = this.rockets.findIndex(
      (rocket) => rocket.id === formData.id
    )

    if (index === -1) return

    const updatedRocket = Object.assign(new Rocket(), formData)

    try {
      await this.#sendRequest(this.updateApiUrl, "PUT", updatedRocket)

      this.rockets[index] = updatedRocket
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült módosítani:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Tömeges módosítás: minden újrahasznosítható rakéta indítási költsége −5% (egy tizedesre kerekítve).
   * A PUT kérések párhuzamosan mennek ki (Promise.all), utána újratöltjük az adatokat.
   *
   * @returns {Promise<void>}
   */
  async reduceReusableCosts() {
    const updatedRockets = this.rockets
      .filter((rocket) => rocket.reusable)
      .map((rocket) =>
        Object.assign(new Rocket(), rocket, {
          costPerLaunch: Math.round(rocket.costPerLaunch * 0.95 * 10) / 10
        })
      )

    try {
      await Promise.all(
        updatedRockets.map((rocket) =>
          this.#sendRequest(this.updateApiUrl, "PUT", rocket)
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
    localStorage.setItem("rockets-sort", sortOrder)
    this.displayData()
  }

  /**
   * Töröl egy rakétát az id-ja alapján; a helyi tömbből csak sikeres válasz után veszi ki.
   *
   * @param {string} rocketId - A rakéta azonosítója.
   * @returns {Promise<void>}
   */
  async #deleteRocket(rocketId) {
    const index = this.rockets.findIndex(
      (rocket) => rocket.id === rocketId
    )

    if (index === -1) return

    try {
      await this.#sendRequest(this.deleteApiUrl, "DELETE", { id: rocketId })

      this.rockets.splice(index, 1)
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült törölni:", error)
      this.renderer.showError(error.message)
    }
  }

  /**
   * Kikeresi a rakétát id alapján, és az űrlap kitöltését a Renderernek adja át.
   *
   * @param {string} rocketId - A rakéta azonosítója.
   * @returns {void}
   */
  #selectRocketForUpdate(rocketId) {
    const rocket = this.rockets.find(
      (rocket) => rocket.id === rocketId
    )

    if (rocket) {
      this.renderer.fillForm(rocket)
    }
  }

  /**
   * Kiszámolja az átlagos indítási költséget.
   *
   * @returns {number} Egy tizedesre kerekített átlag, üres tömbnél 0.
   */
  #calculateAverageCost() {
    if (this.rockets.length === 0) return 0

    const sum = this.rockets.reduce(
      (total, rocket) => total + rocket.costPerLaunch,
      0
    )

    return Math.round((sum / this.rockets.length) * 10) / 10
  }

  /**
   * Megkeresi a legnagyobb teherbírású rakétát (egyezésnél az elsőt).
   *
   * @returns {Rocket|null} A legnagyobb teherbírású rakéta, üres tömbnél null.
   */
  #findHeaviestPayloadRocket() {
    return this.rockets.reduce((heaviest, rocket) => {
      if (!heaviest || rocket.payloadTons > heaviest.payloadTons) {
        return rocket
      }

      return heaviest
    }, null)
  }

  /**
   * Megvizsgálja, hogy minden rakéta újrahasznosítható-e.
   *
   * @returns {boolean} Üres tömbnél false.
   */
  #checkAllReusable() {
    return this.rockets.length > 0 && this.rockets.every((rocket) => rocket.reusable)
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
