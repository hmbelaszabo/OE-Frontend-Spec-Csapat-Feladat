"use strict"

import { API_BASE } from "../shared/config.js"

export class Logic {
  getApiUrl = `${API_BASE}/satellites/getSatellites`
  createApiUrl = `${API_BASE}/satellites/createSatellite`
  updateApiUrl = `${API_BASE}/satellites/updateSatellite`
  deleteApiUrl = `${API_BASE}/satellites/deleteSatellite`
  resetApiUrl = `${API_BASE}/satellites/reset`
  targetOptionsApiUrl = `${API_BASE}/satellites/getTargetOptions`
}
