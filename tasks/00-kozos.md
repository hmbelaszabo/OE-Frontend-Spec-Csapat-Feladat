# 🚀 Űrügynökség – közös tudnivalók (mindenkinek)

Ezt a fájlt olvasd el először, és csak utána a saját modulod feladatleírását (`01-missions.md` … `05-satellites.md`).

## 🔖 Miről szól a projekt?

Az Űrügynökség egy öt modulból álló webalkalmazás. Mindenki **egy modult** készít el, és **ugyanazt a
követelménylistát** teljesíti (06–09. hét anyaga), csak más adatokon. A backend kész, ahhoz nem kell nyúlni:
a feladat a frontend, vagyis az, hogy `fetch`-csel dolgozz a megadott API-útvonalakkal.

| Modul | Mappa | Feladatleírás |
| --- | --- | --- |
| 🛰️ Küldetések | `public/missions/` | `01-missions.md` |
| 👩‍🚀 Asztronauták | `public/astronauts/` | `02-astronauts.md` |
| 🚀 Rakéták | `public/rockets/` | `03-rockets.md` |
| 🪐 Célpontok | `public/targets/` | `04-targets.md` |
| 📡 Műholdak | `public/satellites/` | `05-satellites.md` |

**Időkeret:** 120 perc, ZH-szerűen pontozva (100 + 10 pont). A modul `index.html`-jében csak a közös keret van meg
(head, navbar, **üres `<main>`**, footer, script-ek), a felületet a leírásban megadott Bootstrap-elemekből te építed fel.
A JS-fájlok is megvannak: a **modellosztály kész** (a mezőivel), a `Logic` osztályban már ott vannak a modul
API-címei, a `Renderer` egy üres exportált osztály, a `*-utils.js` és az `app.js` üres.

**Minta-megoldás:** minden modul navbarjában van egy sárga **Megoldás** gomb, ami a `public/megoldasok/<modul>/`
alatti kész megoldást nyitja meg. A navbar **Megoldások** menüjéből bármelyik modulé elérhető. Akkor használd,
ha elakadtál, vagy ha a végén össze akarod vetni a sajátoddal.

## 🛠️ Indulás

1. Klónozd a repót, és hozz létre egy saját branchet: `feat/<modul>-<rövid-leírás>` (pl. `feat/rockets-crud`).
2. Két lehetőséged van a futtatásra:
   - **A) Lokális backenddel (ajánlott):** `npm install`, majd `npm run dev` → nyisd meg a `http://localhost:3000/<modul>/` címet.
   - **B) Live Serverrel:** a futó `npm run dev` mellett a VS Code Live Serverrel (`127.0.0.1:5500`) is megnyithatod az oldalt.
     A `public/shared/config.js` automatikusan a `localhost:3000`-es API-t hívja.
3. **Csak a saját modulmappádban dolgozz.** A `public/shared/`, a `server/` és a többi modul mappája nem a tiéd,
   ezt a CI is ellenőrzi.

## 🌐 Az API általános szabályai

Minden modulnak **saját, elszigetelt API-ja** van (`/api/<modul>/…`), így a többiek adatait nem tudod elrontani.

| Művelet | Metódus | Törzs (body) | Sikeres válasz |
| --- | --- | --- | --- |
| Lista | `GET` | – | `200`, a teljes tömb |
| Létrehozás | `POST` | teljes objektum, **az `id`-t a kliens generálja (GUID)** | `201`, a létrehozott objektum |
| Módosítás | `PUT` | teljes objektum `id`-val | `200`, a módosított objektum |
| Törlés | `DELETE` | `{ "id": "…" }` | `200`, `{ "id": "…" }` |
| Visszaállítás | `POST …/reset` | `{}` | `200`, a kezdő adatok |
| Lookup | `GET` | – | `200`, csak olvasható segédlista |

- A `POST`, `PUT` és `DELETE` kéréseknél kötelező a `Content-Type: application/json` fejléc.
- **Hibák:** a válasz mindig JSON. Validációs hiba esetén `400` és mezőnkénti üzenet érkezik:
  ```json
  { "error": "Validation failed", "fields": { "budget": "must be a positive number" } }
  ```
  További hibakódok: `404` (nincs ilyen `id`), `409` (már létező `id`, vagy elérted a 50 elemes korlátot, ilyenkor használd a resetet), `500`.
- **Szimuláció gyakorláshoz:** bármelyik útvonal mögé írhatod, hogy `?delay=2000` (késleltetés ms-ban, max. 5000;
  ezzel a spinner látszik), illetve `?fail=true` (mindig `500`-as hibát ad; ezzel a hibakezelés tesztelhető).
- Az összes végpont listája JSON-mintákkal együtt: [`server/README.md`](../server/README.md).

## 📐 Közös követelmények (minden modulra)

| # | Feladatrész | Hét |
| --- | --- | --- |
| 0 | Felület Bootstrap 5-tel: fejléc, statisztika-kártyák, eszköztár, állapotüzenetek, kártyarács, `<template>`, modal (a leírás pontosan megadja az elemeket) | 03, 06 |
| 1 | Fájlszerkezet a 09. heti `developer-crud-complex` mintájára: modellosztály, `Logic` (nem nyúl a DOM-hoz), `Renderer` (nem hív `fetch`-et), `*-utils.js`, `app.js`; ES modulok, privát metódusok, JSDoc | 06, 08 |
| 2 | Betöltés: saját lista + saját lookup **párhuzamosan, `Promise.all`-lal**, `async`/`await`-tel; az Újratöltés gomb a listát **`.then()` lánccal** tölti újra; `response.ok` ellenőrzése, spinner, hibaüzenet a státuszkóddal | 09 |
| 3 | Megjelenítés `<template>` + `cloneNode()` segítségével; üres lista esetén fix üzenet | 06 |
| 4 | Létrehozás és szerkesztés modalban külön Létrehozás / Módosítás gombbal (az `id` GUID, a kliens generálja), törlés megerősítéssel | 06, 09 |
| 5 | 3 statisztika tömbmetódusokkal (`reduce`, `some` vagy `every`); `find` a kikeresésekhez (szerkesztendő elem, lookup-név) | 08 |
| 6 | Rendezés választóval **az eredeti tömb módosítása nélkül**; a választás `localStorage`-ben marad meg | 06, 08 |
| 7 | Tömeges módosítás egy gombbal: több `PUT` kérés egyszerre, `Promise.all`-lal, utána újratöltés | 09 |
| 8 | Debug-mini: a `debug/buggy.js` két hibás függvényének javítása breakpointtal, 3–4 soros `DEBUG.md` | 07 |

**Bónusz:** kategorizálás három színes kártyára · a `?delay` / `?fail` kipróbálása · `tasks/elmelet.md` kérdései.

## 🎨 UI-konvenció (egységes kinézet)

- **Saját CSS, `<style>` és `style=""` nem lehet a modulmappában**, csak Bootstrap-osztályokat és a közös `base.css` osztályait
  (`page-icon`, `stat-card`, `stat-value`, `entity-card`, `entity-img`, `entity-placeholder`) használhatod. Ezt a CI is ellenőrzi.
- Elem: `card` a `row-cols-1 row-cols-md-2 row-cols-lg-3` rácsban. Statisztika: `card text-center`.
- Gombszínek: új = `btn-primary`, szerkesztés = `btn-outline-secondary`, törlés = `btn-outline-danger`, tömeges művelet = `btn-warning`;
  a modalban Létrehozás = `btn-success`, Módosítás = `btn-warning`.
- Logikai érték: `badge` (`text-bg-success` / `text-bg-secondary`). Hiba: `alert alert-danger`. Betöltés: `spinner-border`.
- A navbar (benne a téma-váltó és a Megoldás gomb), a dark mode és a `<noscript>` a vázban már benne van, ezeket ne rontsd el.

## 🔀 Beadás (Git-folyamat)

A lépésenkénti parancsok (parancssor és lazygit) a [README Git-útmutatójában](../README.md#-git-útmutató) vannak.

1. Kis lépésekben commitolj, beszédes üzenetekkel („commit small, commit often”), pl. `rockets: betöltés Promise.all-lal`.
2. `git push`, majd nyiss **Pull Requestet** a `main`-re, és töltsd ki a PR-sablon ellenőrzőlistáját.
3. A Vercel pár perc múlva kommentben kiírja az **előnézeti linket**: ott próbáld ki a modulodat.
4. Ha az előnézeten minden működik, merge-eld a PR-t (**Squash and merge**); review nem kell. Pár perc múlva megjelenik az éles oldalon.
