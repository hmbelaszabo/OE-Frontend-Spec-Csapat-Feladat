"use strict"

import { API_BASE } from "../../shared/config.js"
import { Satellite } from "./satellite.js"
import { categorizeSatellites, sortSatellites } from "./satellite-utils.js"

/**
 * Üzleti logika: adatok, API-hívások, statisztika. A DOM-hoz nem nyúl,
 * minden megjelenítést a Renderer végez.
 */
export class Logic {
  getApiUrl = `${API_BASE}/satellites/getSatellites`
  createApiUrl = `${API_BASE}/satellites/createSatellite`
  updateApiUrl = `${API_BASE}/satellites/updateSatellite`
  deleteApiUrl = `${API_BASE}/satellites/deleteSatellite`
  resetApiUrl = `${API_BASE}/satellites/reset`
  targetOptionsApiUrl = `${API_BASE}/satellites/getTargetOptions`

  satellites = []
  targetOptions = []
  operationalRatio = 0
  sortOrder = localStorage.getItem("satellites-sort") ?? "name-asc"

  /**
   * Inicializálja az üzleti logikát a kapott Renderer-példánnyal, és beköti az eseményeket.
   *
   * @param {Renderer} renderer - A DOM-műveletekért felelős Renderer.
   */
  constructor(renderer) {
    this.renderer = renderer

    this.renderer.bindEvents(
      () => this.addSatellite(),
      () => this.updateSatellite(),
      () => this.shutDownOldSatellites(),
      () => this.loadDataWithThen(),
      () => this.resetData(),
      (sortOrder) => this.changeSortOrder(sortOrder)
    )
    this.renderer.setSortValue(this.sortOrder)
  }

  /**
   * Lekéri a műholdakat és az égitest-lookupot párhuzamosan (Promise.all),
   * és feltölti a helyi tömböket.
   *
   * @returns {Promise<void>}
   * @throws {Error} Ha bármelyik kérés sikertelen.
   */
  async loadData() {
    const [satelliteResponse, targetResponse] = await Promise.all([
      fetch(this.getApiUrl),
      fetch(this.targetOptionsApiUrl)
    ])

    if (!satelliteResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${satelliteResponse.status})`)
    }
    if (!targetResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${targetResponse.status})`)
    }

    const data = await satelliteResponse.json()
    this.targetOptions = await targetResponse.json()
    console.log("GET API response:", data)

    this.satellites = data.map((item) => Object.assign(new Satellite(), item))
    this.renderer.fillTargetSelect(this.targetOptions)
  }

  /**
   * Csak a műholdak listáját tölti újra, .then() lánccal (Újratöltés gomb).
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
        this.satellites = data.map((item) => Object.assign(new Satellite(), item))
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
    this.operationalRatio = this.#calculateOperationalRatio()
    const totalMass = this.#calculateTotalMass()
    const oldestSatellite = this.#findOldestSatellite()

    this.renderer.hideError()
    this.renderer.renderStatistics(this.operationalRatio, totalMass, oldestSatellite)

    this.renderer.render(
      sortSatellites(this.satellites, this.sortOrder),
      this.targetOptions,
      this.#deleteSatellite.bind(this),
      this.#selectSatelliteForUpdate.bind(this)
    )

    this.renderer.renderCategories(categorizeSatellites(this.satellites))
  }

  /**
   * Új műholdat hoz létre a Renderertől kapott űrlapadatokból.
   * GUID-ot generál, POST kérést küld, és csak sikeres válasz után bővíti a helyi tömböt.
   *
   * @returns {Promise<void>}
   */
  async addSatellite() {
    const formData = this.renderer.readForm()

    const newSatellite = Object.assign(new Satellite(), formData, {
      id: this.#generateGuid()
    })

    try {
      await this.#sendRequest(this.createApiUrl, "POST", newSatellite)

      this.satellites.push(newSatellite)
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült létrehozni:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Módosít egy meglévő műholdat az id-ja alapján.
   * PUT kérést küld, és csak sikeres válasz után cseréli a helyi tömb elemét.
   *
   * @returns {Promise<void>}
   */
  async updateSatellite() {
    const formData = this.renderer.readForm()

    const index = this.satellites.findIndex(
      (satellite) => satellite.id === formData.id
    )

    if (index === -1) return

    const updatedSatellite = Object.assign(new Satellite(), formData)

    try {
      await this.#sendRequest(this.updateApiUrl, "PUT", updatedSatellite)

      this.satellites[index] = updatedSatellite
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült módosítani:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Tömeges módosítás: minden működő, 15 évnél régebbi műhold leállítása.
   * A PUT kérések párhuzamosan mennek ki (Promise.all), utána újratöltjük az adatokat.
   *
   * @returns {Promise<void>}
   */
  async shutDownOldSatellites() {
    const currentYear = new Date().getFullYear()

    const updatedSatellites = this.satellites
      .filter((satellite) => satellite.operational && currentYear - satellite.launchYear > 15)
      .map((satellite) =>
        Object.assign(new Satellite(), satellite, {
          operational: false
        })
      )

    try {
      await Promise.all(
        updatedSatellites.map((satellite) =>
          this.#sendRequest(this.updateApiUrl, "PUT", satellite)
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
    localStorage.setItem("satellites-sort", sortOrder)
    this.displayData()
  }

  /**
   * Töröl egy műholdat az id-ja alapján; a helyi tömbből csak sikeres válasz után veszi ki.
   *
   * @param {string} satelliteId - A műhold azonosítója.
   * @returns {Promise<void>}
   */
  async #deleteSatellite(satelliteId) {
    const index = this.satellites.findIndex(
      (satellite) => satellite.id === satelliteId
    )

    if (index === -1) return

    try {
      await this.#sendRequest(this.deleteApiUrl, "DELETE", { id: satelliteId })

      this.satellites.splice(index, 1)
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült törölni:", error)
      this.renderer.showError(error.message)
    }
  }

  /**
   * Kikeresi a műholdat id alapján, és az űrlap kitöltését a Renderernek adja át.
   *
   * @param {string} satelliteId - A műhold azonosítója.
   * @returns {void}
   */
  #selectSatelliteForUpdate(satelliteId) {
    const satellite = this.satellites.find(
      (satellite) => satellite.id === satelliteId
    )

    if (satellite) {
      this.renderer.fillForm(satellite)
    }
  }

  /**
   * Kiszámolja a működő műholdak arányát százalékban.
   *
   * @returns {number} Egészre kerekített százalék, üres tömbnél 0.
   */
  #calculateOperationalRatio() {
    if (this.satellites.length === 0) return 0

    const operationalCount = this.satellites.filter(
      (satellite) => satellite.operational
    ).length

    return Math.round((operationalCount / this.satellites.length) * 100)
  }

  /**
   * Kiszámolja a műholdak össztömegét.
   *
   * @returns {number} Össztömeg kilogrammban.
   */
  #calculateTotalMass() {
    return this.satellites.reduce(
      (total, satellite) => total + satellite.massKg,
      0
    )
  }

  /**
   * Megkeresi a legkorábban indított műholdat (egyezésnél az elsőt).
   *
   * @returns {Satellite|null} A legrégebbi műhold, üres tömbnél null.
   */
  #findOldestSatellite() {
    return this.satellites.reduce((oldest, satellite) => {
      if (!oldest || satellite.launchYear < oldest.launchYear) {
        return satellite
      }

      return oldest
    }, null)
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
