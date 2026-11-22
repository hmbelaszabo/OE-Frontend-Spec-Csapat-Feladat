"use strict"

import { API_BASE } from "../shared/config.js"

export class Logic {
  getApiUrl = `${API_BASE}/missions/getMissions`
  createApiUrl = `${API_BASE}/missions/createMission`
  updateApiUrl = `${API_BASE}/missions/updateMission`
  deleteApiUrl = `${API_BASE}/missions/deleteMission`
  resetApiUrl = `${API_BASE}/missions/reset`
  rocketOptionsApiUrl = `${API_BASE}/missions/getRocketOptions`
}
