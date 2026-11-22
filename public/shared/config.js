"use strict"

/**
 * Az API alapcíme – minden modul innen importálja.
 *
 * - `npm run dev` után a http://localhost:3000 címen ugyanarról a szerverről jön az oldal és az API → "/api"
 * - Vercelen (éles oldal) szintén "/api"
 * - VS Code Live Serverrel (5500-as port) a lokálisan futó backendet hívjuk.
 *   Ha nincs lokális backend, írd át az éles címre: "https://<projekt>.vercel.app/api"
 */
export const API_BASE =
  location.port === "5500" ? "http://localhost:3000/api" : "/api"
