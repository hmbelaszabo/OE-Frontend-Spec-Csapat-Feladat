"use strict"

import { API_BASE } from "../../shared/config.js"
import { Target } from "./target.js"
import { categorizeTargets, sortTargets } from "./target-utils.js"

/**
 * Üzleti logika: adatok, API-hívások, statisztika. A DOM-hoz nem nyúl,
 * minden megjelenítést a Renderer végez.
 */
export class Logic {
  getApiUrl = `${API_BASE}/targets/getTargets`
  createApiUrl = `${API_BASE}/targets/createTarget`
  updateApiUrl = `${API_BASE}/targets/updateTarget`
  deleteApiUrl = `${API_BASE}/targets/deleteTarget`
  resetApiUrl = `${API_BASE}/targets/reset`
  visitsApiUrl = `${API_BASE}/targets/getVisits`

  targets = []
  visits = []
  avgTemperature = 0
  sortOrder = localStorage.getItem("targets-sort") ?? "name-asc"

  /**
   * Inicializálja az üzleti logikát a kapott Renderer-példánnyal, és beköti az eseményeket.
   *
   * @param {Renderer} renderer - A DOM-műveletekért felelős Renderer.
   */
  constructor(renderer) {
    this.renderer = renderer

    this.renderer.bindEvents(
      () => this.addTarget(),
      () => this.updateTarget(),
      () => this.reevaluateHabitability(),
      () => this.loadDataWithThen(),
      () => this.resetData(),
      (sortOrder) => this.changeSortOrder(sortOrder)
    )
    this.renderer.setSortValue(this.sortOrder)
  }

  /**
   * Lekéri a célpontokat és a látogatás-lookupot párhuzamosan (Promise.all),
   * és feltölti a helyi tömböket.
   *
   * @returns {Promise<void>}
   * @throws {Error} Ha bármelyik kérés sikertelen.
   */
  async loadData() {
    const [targetResponse, visitResponse] = await Promise.all([
      fetch(this.getApiUrl),
      fetch(this.visitsApiUrl)
    ])

    if (!targetResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${targetResponse.status})`)
    }
    if (!visitResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${visitResponse.status})`)
    }

    const data = await targetResponse.json()
    this.visits = await visitResponse.json()
    console.log("GET API response:", data)

    this.targets = data.map((item) => Object.assign(new Target(), item))
  }

  /**
   * Csak a célpontok listáját tölti újra, .then() lánccal (Újratöltés gomb).
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
        this.targets = data.map((item) => Object.assign(new Target(), item))
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
    this.avgTemperature = this.#calculateAverageTemperature()
    const closestTarget = this.#findClosestTarget()
    const hasHabitable = this.#checkHasHabitable()

    this.renderer.hideError()
    this.renderer.renderStatistics(closestTarget, this.avgTemperature, hasHabitable)

    this.renderer.render(
      sortTargets(this.targets, this.sortOrder),
      this.visits,
      this.#deleteTarget.bind(this),
      this.#selectTargetForUpdate.bind(this)
    )

    this.renderer.renderCategories(categorizeTargets(this.targets))
  }

  /**
   * Új célpontot hoz létre a Renderertől kapott űrlapadatokból.
   * GUID-ot generál, POST kérést küld, és csak sikeres válasz után bővíti a helyi tömböt.
   *
   * @returns {Promise<void>}
   */
  async addTarget() {
    const formData = this.renderer.readForm()

    const newTarget = Object.assign(new Target(), formData, {
      id: this.#generateGuid()
    })

    try {
      await this.#sendRequest(this.createApiUrl, "POST", newTarget)

      this.targets.push(newTarget)
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült létrehozni:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Módosít egy meglévő célpontot az id-ja alapján.
   * PUT kérést küld, és csak sikeres válasz után cseréli a helyi tömb elemét.
   *
   * @returns {Promise<void>}
   */
  async updateTarget() {
    const formData = this.renderer.readForm()

    const index = this.targets.findIndex(
      (target) => target.id === formData.id
    )

    if (index === -1) return

    const updatedTarget = Object.assign(new Target(), formData)

    try {
      await this.#sendRequest(this.updateApiUrl, "PUT", updatedTarget)

      this.targets[index] = updatedTarget
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült módosítani:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Tömeges módosítás: a lakhatóság újraértékelése (lakható, ha −50 és +50 °C között van).
   * Csak a megváltozó célpontokra megy PUT kérés, párhuzamosan (Promise.all),
   * utána újratöltjük az adatokat.
   *
   * @returns {Promise<void>}
   */
  async reevaluateHabitability() {
    const changedTargets = this.targets
      .map((target) =>
        Object.assign(new Target(), target, {
          habitable: target.avgTempC >= -50 && target.avgTempC <= 50
        })
      )
      .filter((target, index) => target.habitable !== this.targets[index].habitable)

    try {
      await Promise.all(
        changedTargets.map((target) =>
          this.#sendRequest(this.updateApiUrl, "PUT", target)
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
    localStorage.setItem("targets-sort", sortOrder)
    this.displayData()
  }

  /**
   * Töröl egy célpontot az id-ja alapján; a helyi tömbből csak sikeres válasz után veszi ki.
   *
   * @param {string} targetId - A célpont azonosítója.
   * @returns {Promise<void>}
   */
  async #deleteTarget(targetId) {
    const index = this.targets.findIndex(
      (target) => target.id === targetId
    )

    if (index === -1) return

    try {
      await this.#sendRequest(this.deleteApiUrl, "DELETE", { id: targetId })

      this.targets.splice(index, 1)
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült törölni:", error)
      this.renderer.showError(error.message)
    }
  }

  /**
   * Kikeresi a célpontot id alapján, és az űrlap kitöltését a Renderernek adja át.
   *
   * @param {string} targetId - A célpont azonosítója.
   * @returns {void}
   */
  #selectTargetForUpdate(targetId) {
    const target = this.targets.find(
      (target) => target.id === targetId
    )

    if (target) {
      this.renderer.fillForm(target)
    }
  }

  /**
   * Kiszámolja az átlaghőmérsékletet.
   *
   * @returns {number} Egy tizedesre kerekített átlag, üres tömbnél 0.
   */
  #calculateAverageTemperature() {
    if (this.targets.length === 0) return 0

    const sum = this.targets.reduce(
      (total, target) => total + target.avgTempC,
      0
    )

    return Math.round((sum / this.targets.length) * 10) / 10
  }

  /**
   * Megkeresi a Földhöz legközelebbi célpontot (egyezésnél az elsőt).
   *
   * @returns {Target|null} A legközelebbi célpont, üres tömbnél null.
   */
  #findClosestTarget() {
    return this.targets.reduce((closest, target) => {
      if (!closest || target.distanceMkm < closest.distanceMkm) {
        return target
      }

      return closest
    }, null)
  }

  /**
   * Megvizsgálja, van-e legalább egy lakható célpont.
   *
   * @returns {boolean}
   */
  #checkHasHabitable() {
    return this.targets.some((target) => target.habitable)
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
