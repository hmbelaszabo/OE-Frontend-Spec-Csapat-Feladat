"use strict"

import { Logic } from "./logic.js"
import { Renderer } from "./renderer.js"

const renderer = new Renderer()
const logic = new Logic(renderer)

renderer.showLoading(true)

try {
  await logic.loadData()
  logic.displayData()
} catch (error) {
  console.error("Nem sikerült betölteni a rakétákat:", error)
  renderer.showError(error.message)
}

renderer.showLoading(false)
