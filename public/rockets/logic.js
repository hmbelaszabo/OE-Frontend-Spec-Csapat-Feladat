"use strict"

import { API_BASE } from "../shared/config.js"

export class Logic {
  getApiUrl = `${API_BASE}/rockets/getRockets`
  createApiUrl = `${API_BASE}/rockets/createRocket`
  updateApiUrl = `${API_BASE}/rockets/updateRocket`
  deleteApiUrl = `${API_BASE}/rockets/deleteRocket`
  resetApiUrl = `${API_BASE}/rockets/reset`
  launchesApiUrl = `${API_BASE}/rockets/getLaunches`
}
