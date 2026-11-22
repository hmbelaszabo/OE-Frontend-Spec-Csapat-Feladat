"use strict"

import { API_BASE } from "../../shared/config.js"
import { Mission } from "./mission.js"
import { categorizeMissions, isUpcoming, sortMissions } from "./mission-utils.js"

/**
 * Üzleti logika: adatok, API-hívások, statisztika. A DOM-hoz nem nyúl,
 * minden megjelenítést a Renderer végez.
 */
export class Logic {
  getApiUrl = `${API_BASE}/missions/getMissions`
  createApiUrl = `${API_BASE}/missions/createMission`
  updateApiUrl = `${API_BASE}/missions/updateMission`
  deleteApiUrl = `${API_BASE}/missions/deleteMission`
  resetApiUrl = `${API_BASE}/missions/reset`
  rocketOptionsApiUrl = `${API_BASE}/missions/getRocketOptions`

  missions = []
  rocketOptions = []
  totalBudget = 0
  sortOrder = localStorage.getItem("missions-sort") ?? "name-asc"

  /**
   * Inicializálja az üzleti logikát a kapott Renderer-példánnyal, és beköti az eseményeket.
   *
   * @param {Renderer} renderer - A DOM-műveletekért felelős Renderer.
   */
  constructor(renderer) {
    this.renderer = renderer

    this.renderer.bindEvents(
      () => this.addMission(),
      () => this.updateMission(),
      () => this.raiseUpcomingBudgets(),
      () => this.loadDataWithThen(),
      () => this.resetData(),
      (sortOrder) => this.changeSortOrder(sortOrder)
    )
    this.renderer.setSortValue(this.sortOrder)
  }

  /**
   * Lekéri a küldetéseket és a rakéta-lookupot párhuzamosan (Promise.all),
   * és feltölti a helyi tömböket.
   *
   * @returns {Promise<void>}
   * @throws {Error} Ha bármelyik kérés sikertelen.
   */
  async loadData() {
    const [missionResponse, rocketResponse] = await Promise.all([
      fetch(this.getApiUrl),
      fetch(this.rocketOptionsApiUrl)
    ])

    if (!missionResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${missionResponse.status})`)
    }
    if (!rocketResponse.ok) {
      throw new Error(`Nem sikerült betölteni az adatokat (HTTP ${rocketResponse.status})`)
    }

    const data = await missionResponse.json()
    this.rocketOptions = await rocketResponse.json()
    console.log("GET API response:", data)

    this.missions = data.map((item) => Object.assign(new Mission(), item))
    this.renderer.fillRocketSelect(this.rocketOptions)
  }

  /**
   * Csak a küldetések listáját tölti újra, .then() lánccal (Újratöltés gomb).
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
        this.missions = data.map((item) => Object.assign(new Mission(), item))
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
    this.totalBudget = this.#calculateTotalBudget()
    const longestMission = this.#findLongestMission()
    const hasFailed = this.#checkHasFailed()

    this.renderer.hideError()
    this.renderer.renderStatistics(this.totalBudget, longestMission, hasFailed)

    this.renderer.render(
      sortMissions(this.missions, this.sortOrder),
      this.rocketOptions,
      this.#deleteMission.bind(this),
      this.#selectMissionForUpdate.bind(this)
    )

    this.renderer.renderCategories(categorizeMissions(this.missions))
  }

  /**
   * Új küldetést hoz létre a Renderertől kapott űrlapadatokból.
   * GUID-ot generál, POST kérést küld, és csak sikeres válasz után bővíti a helyi tömböt.
   *
   * @returns {Promise<void>}
   */
  async addMission() {
    const formData = this.renderer.readForm()

    const newMission = Object.assign(new Mission(), formData, {
      id: this.#generateGuid()
    })

    try {
      await this.#sendRequest(this.createApiUrl, "POST", newMission)

      this.missions.push(newMission)
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült létrehozni:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Módosít egy meglévő küldetést az id-ja alapján.
   * PUT kérést küld, és csak sikeres válasz után cseréli a helyi tömb elemét.
   *
   * @returns {Promise<void>}
   */
  async updateMission() {
    const formData = this.renderer.readForm()

    const index = this.missions.findIndex(
      (mission) => mission.id === formData.id
    )

    if (index === -1) return

    const updatedMission = Object.assign(new Mission(), formData)

    try {
      await this.#sendRequest(this.updateApiUrl, "PUT", updatedMission)

      this.missions[index] = updatedMission
      this.renderer.clearForm()
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült módosítani:", error)
      this.renderer.showFormError(error.message)
    }
  }

  /**
   * Tömeges módosítás: minden jövőbeli küldetés költségvetése +10% (egy tizedesre kerekítve).
   * A PUT kérések párhuzamosan mennek ki (Promise.all), utána újratöltjük az adatokat.
   *
   * @returns {Promise<void>}
   */
  async raiseUpcomingBudgets() {
    const updatedMissions = this.missions
      .filter((mission) => isUpcoming(mission))
      .map((mission) =>
        Object.assign(new Mission(), mission, {
          budget: Math.round(mission.budget * 1.1 * 10) / 10
        })
      )

    try {
      await Promise.all(
        updatedMissions.map((mission) =>
          this.#sendRequest(this.updateApiUrl, "PUT", mission)
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
    localStorage.setItem("missions-sort", sortOrder)
    this.displayData()
  }

  /**
   * Töröl egy küldetést az id-ja alapján; a helyi tömbből csak sikeres válasz után veszi ki.
   *
   * @param {string} missionId - A küldetés azonosítója.
   * @returns {Promise<void>}
   */
  async #deleteMission(missionId) {
    const index = this.missions.findIndex(
      (mission) => mission.id === missionId
    )

    if (index === -1) return

    try {
      await this.#sendRequest(this.deleteApiUrl, "DELETE", { id: missionId })

      this.missions.splice(index, 1)
      this.displayData()
    } catch (error) {
      console.error("Nem sikerült törölni:", error)
      this.renderer.showError(error.message)
    }
  }

  /**
   * Kikeresi a küldetést id alapján, és az űrlap kitöltését a Renderernek adja át.
   *
   * @param {string} missionId - A küldetés azonosítója.
   * @returns {void}
   */
  #selectMissionForUpdate(missionId) {
    const mission = this.missions.find(
      (mission) => mission.id === missionId
    )

    if (mission) {
      this.renderer.fillForm(mission)
    }
  }

  /**
   * Kiszámolja az összes küldetés költségvetésének összegét.
   *
   * @returns {number} Az összeg millió dollárban, üres tömbnél 0.
   */
  #calculateTotalBudget() {
    return this.missions.reduce(
      (total, mission) => total + mission.budget,
      0
    )
  }

  /**
   * Megkeresi a leghosszabb küldetést (egyezésnél az elsőt).
   *
   * @returns {Mission|null} A leghosszabb küldetés, üres tömbnél null.
   */
  #findLongestMission() {
    return this.missions.reduce((longest, mission) => {
      if (!longest || mission.durationDays > longest.durationDays) {
        return mission
      }

      return longest
    }, null)
  }

  /**
   * Megvizsgálja, volt-e sikertelen küldetés a már elindultak között.
   *
   * @returns {boolean}
   */
  #checkHasFailed() {
    return this.missions.some((mission) => !isUpcoming(mission) && !mission.successful)
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
