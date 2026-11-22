"use strict"

/*
 * Dark mode kapcsoló (közös, kész fájl – ne módosítsd).
 * Sima <script>-ként a <head>-ben töltődik be, hogy betöltéskor ne villanjon a világos téma.
 * A választást a localStorage "theme" kulcsa őrzi.
 */
;(() => {
  const STORAGE_KEY = "theme"

  const apply = (theme) => {
    document.documentElement.setAttribute("data-bs-theme", theme)

    const icon = document.querySelector("#theme-toggle i")
    if (icon) {
      icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars"
    }
  }

  apply(localStorage.getItem(STORAGE_KEY) ?? "dark")

  document.addEventListener("DOMContentLoaded", () => {
    apply(document.documentElement.getAttribute("data-bs-theme"))

    document.querySelector("#theme-toggle")?.addEventListener("click", () => {
      const next =
        document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark"
      localStorage.setItem(STORAGE_KEY, next)
      apply(next)
    })
  })
})()
