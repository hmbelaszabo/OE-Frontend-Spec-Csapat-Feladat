"use strict"

import { API_BASE } from "../shared/config.js"

export class Logic {
  getApiUrl = `${API_BASE}/astronauts/getAstronauts`
  createApiUrl = `${API_BASE}/astronauts/createAstronaut`
  updateApiUrl = `${API_BASE}/astronauts/updateAstronaut`
  deleteApiUrl = `${API_BASE}/astronauts/deleteAstronaut`
  resetApiUrl = `${API_BASE}/astronauts/reset`
  missionOptionsApiUrl = `${API_BASE}/astronauts/getMissionOptions`
}
