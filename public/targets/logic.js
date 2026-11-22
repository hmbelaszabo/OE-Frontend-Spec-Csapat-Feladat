"use strict"

import { API_BASE } from "../shared/config.js"

export class Logic {
  getApiUrl = `${API_BASE}/targets/getTargets`
  createApiUrl = `${API_BASE}/targets/createTarget`
  updateApiUrl = `${API_BASE}/targets/updateTarget`
  deleteApiUrl = `${API_BASE}/targets/deleteTarget`
  resetApiUrl = `${API_BASE}/targets/reset`
  visitsApiUrl = `${API_BASE}/targets/getVisits`
}
