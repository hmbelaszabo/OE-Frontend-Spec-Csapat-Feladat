# 📡 Műholdak – ZH-gyakorló feladat

> **Lefedett tananyag:** 06–09. hét (OOP CRUD, debug, ES modulok és tömbmetódusok, Promise / `fetch`)
> **Időkeret:** 120 perc · **Pontszám:** 100 pont + 10 bónuszpont · **Ponthatár:** 50 pont
> **Segédanyag:** az órai anyagok (06–09. mappák), MDN és a Bootstrap dokumentációja
> **Beadás:** PR a `main`-re a saját branchedről (`feat/satellites-…`), ld. [`00-kozos.md`](00-kozos.md)

---

## Tartalom

| # | Feladat | Hét | Pont |
| --- | --- | --- | --- |
| 1. | [Felület Bootstrap 5-tel](#-1-felület-bootstrap-5-tel) | 03, 06 | 20 |
| 2. | [Modulfájlok](#-2-modulfájlok) | 06, 08 | 5 |
| 3. | [Betöltés az API-ról](#-3-betöltés-az-api-ról) | 09 | 15 |
| 4. | [Megjelenítés sablonból](#-4-megjelenítés-sablonból) | 06 | 15 |
| 5. | [Létrehozás, szerkesztés, törlés](#-5-létrehozás-szerkesztés-törlés) | 06, 09 | 20 |
| 6. | [Statisztika](#-6-statisztika) | 08 | 10 |
| 7. | [Rendezés](#-7-rendezés) | 06, 08 | 5 |
| 8. | [Tömeges módosítás](#-8-tömeges-módosítás) | 09 | 5 |
| 9. | [Debug-mini](#-9-debug-mini) | 07 | 5 |
| ⭐ | [Bónusz: kategorizálás](#-bónusz-kategorizálás-10-pont) | 08 | +10 |

---

## 🔖 A feladat célja

Készítsd el az Űrügynökség **Műholdak** oldalát a `public/satellites/` mappában. Az oldal a saját API-ról tölti be
a műholdakat és az égitestek listáját, és Bootstrap-kártyákon jeleníti meg őket. Kezeli a létrehozást, a szerkesztést
és a törlést, statisztikát számol, rendez, és egyetlen gombnyomással leállítja a 15 évnél régebbi, még működő műholdakat.

## Fontos követelmények

- **Saját CSS-t és `<style>` blokkot nem írhatsz, és `style=""` attribútumot sem használhatsz** (ezt a CI ellenőrzi). Csak Bootstrap-osztályokat, valamint a közös
  `public/shared/base.css` alábbi osztályait használhatod:

  | Osztály | Hová kerül |
  | --- | --- |
  | `page-icon` | az oldalcím ikonjára (lila, színátmenetes) |
  | `stat-card`, `stat-value` | a statisztika-kártyára, illetve a benne lévő értékre |
  | `entity-card` | a műhold-kártya `card` elemére (hover-effekt) |

- A `Logic` osztály **nem nyúlhat a DOM-hoz**, a `Renderer` osztály **nem hívhat `fetch`-et**.
- A tömbfeladatokat lehetőség szerint **`for` / `while` ciklus nélkül**, tömbmetódusokkal oldd meg, és **az eredeti tömb nem módosulhat**.
- Minden API-hívásnál ellenőrizd a `response.ok` értékét, a hibákat pedig kezeld le.
- Az alábbi **azonosítókat pontosan így használd**, mert a review és a tesztelés ezekre épül.

### Kiinduló állapot

```txt
public/satellites/
├── index.html            kész: <head> (Bootstrap, Icons, base.css, theme.js), navbar, ÜRES <main>, footer, script-ek
├── satellite.js          Satellite modellosztály a mezőivel (kész)
├── satellite-utils.js    üres
├── logic.js              Logic osztály – az API-címek már benne vannak (kész), a többi hiányzik
├── renderer.js           üres Renderer osztály (exportálva)
├── app.js                üres – belépési pont (az index.html már betölti modulként)
└── debug/                kész: buggy.js, index.html, DEBUG.md (sablon)
```

> 💡 **Megoldás:** a navbar sárga **Megoldás** gombja a minta-megoldást nyitja meg (`public/megoldasok/satellites/`).
> Akkor nézd meg, ha elakadtál, vagy ha a végén össze akarod vetni a sajátoddal. A megoldásból a **Vissza a feladathoz** gombbal jutsz vissza.

A `public/shared/config.js` exportálja az API alapcímét (`API_BASE`). Ezt importáld, és ne írd be kézzel az URL-t.

### API

| Végpont | Metódus | Leírás |
| --- | --- | --- |
| `/api/satellites/getSatellites` | `GET` | a műholdak listája |
| `/api/satellites/createSatellite` | `POST` | új műhold (teljes objektum, **a kliens generálja a GUID-ot**) |
| `/api/satellites/updateSatellite` | `PUT` | műhold módosítása (teljes objektum) |
| `/api/satellites/deleteSatellite` | `DELETE` | törlés, body: `{ "id": "…" }` |
| `/api/satellites/reset` | `POST` | a kezdő adatok visszaállítása |
| `/api/satellites/getTargetOptions` | `GET` | **lookup:** égitestek `{ id, name }` párjai |

```json
{
  "id": "fc6725f8-7e2a-4a5d-be7a-bf6d139de89d",
  "name": "Hubble űrtávcső",
  "targetId": "5126aa7b-35a7-4093-bad9-1ec0da8e0c05",
  "altitudeKm": 540,
  "massKg": 11110,
  "launchYear": 1990,
  "operational": true,
  "instruments": ["WFC3", "COS", "STIS"]
}
```

Szabályok: a `targetId` csak a lookupban szereplő `id` lehet · `altitudeKm` > 0 · `massKg` > 0 · `launchYear` egész szám
1957 és 2100 között · `instruments` legfeljebb 10 szöveg. Hiba esetén `400`, a válasz
`{ "error": "Validation failed", "fields": { "massKg": "must be a positive number" } }` formájú.

---

## 📌 1. Felület Bootstrap 5-tel (20 pont)

### Felhasznált technikák (03. és 06. hét)

`container`, grid (`row`, `row-cols-*`, `col`, `g-*`), `card` (`card-header`, `card-body`, `card-title`, `card-footer`),
`list-group list-group-flush`, `input-group`, `form-select`, `form-floating`, `form-control`, `form-check form-switch`,
`btn btn-*`, `badge`, `alert`, `spinner-border`, `modal`, `<template>`, Bootstrap Icons, segédosztályok (`d-flex`,
`d-none`, `gap-*`, `ms-auto`, `text-center`, `text-body-secondary`, `h-100`)

### Feladat

A `<main class="container py-4">` elembe, a `<noscript>` alá építsd fel a következőket, ebben a sorrendben:

1. **Oldalfejléc** (`<header>`): `h1` cím `bi-broadcast` ikonnal (`page-icon` osztály), alatta egy egymondatos,
   halvány (`text-body-secondary`) leírás.
2. **Statisztika-sor:** három oszlop `row row-cols-1 row-cols-md-3 g-3` rácsban. Mindegyik egy
   `card text-center h-100 stat-card` legyen:
   - a `card-header`-ben ikon és felirat (kis, halvány betűvel),
   - a `card-body`-ban egy `stat-value` osztályú elem `–` kezdőértékkel, a lenti id-vel.

   | Felirat | Ikon | Az érték `id`-ja |
   | --- | --- | --- |
   | Működő műholdak aránya | `bi-activity` | `stat-operational-ratio` |
   | Össztömeg | `bi-boxes` | `stat-total-mass` |
   | Legrégebbi műhold | `bi-hourglass-bottom` | `stat-oldest` |

3. **Eszköztár:** egyetlen `card`, a `card-body`-ban egy sorban (`d-flex flex-wrap align-items-center gap-2`):
   - balra egy `input-group`: egy ikon (`bi-sort-down`) és egy `form-select` (`#sort-select`) ezekkel az opciókkal:
     `name-asc` „Név (A–Z)”, `altitudeKm-asc` „Pályamagasság (növekvő)”, `launchYear-asc` „Indítás éve (növekvő)”;
   - jobbra igazítva (`ms-auto`) négy gomb:

   | `id` | Felirat / ikon | Stílus |
   | --- | --- | --- |
   | `new-btn` | `bi-plus-lg` Új műhold | `btn-primary` |
   | `bulk-btn` | `bi-power` 15 évnél régebbiek leállítása | `btn-warning` |
   | `reload-btn` | csak `bi-arrow-clockwise` ikon, `title="Újratöltés"` | `btn-outline-secondary` |
   | `reset-btn` | csak `bi-arrow-counterclockwise` ikon, `title="Adatok visszaállítása"` | `btn-outline-danger` |

4. **Állapotüzenetek** (alapból mind rejtett, `d-none`):
   - `#loading`: középre igazított `spinner-border` és alatta a „Betöltés…” felirat;
   - `#error-alert`: `alert alert-danger`;
   - `#empty-message`: középre igazított, halvány bekezdés a „Nincs megjeleníthető műhold.” szöveggel.
5. **Kártyarács:** egy üres `#target` elem `row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3` osztályokkal.
6. **Kártyasablon** (`<template id="card-template">`, a `<main>`-en kívül): egy `col`, benne egy `card h-100 entity-card`.
   A tartalom felülről lefelé:
   - **`card-header`** (`d-flex justify-content-between align-items-center`): balra az égitest neve `bi-globe-americas`
     ikonnal (kicsi, halvány betűvel), jobbra az állapot `badge`;
   - **`card-body`:** `card-title` (h5 méretű) a névvel, alatta a műszerek helye (`d-flex flex-wrap gap-1`);
   - **`list-group list-group-flush`:** három sor (Pályamagasság `bi-arrows-vertical`, Tömeg `bi-box-seam`,
     Indítás éve `bi-calendar-event`). A sorokban balra a halvány felirat ikonnal, jobbra félkövéren az érték
     (`d-flex justify-content-between`);
   - **`card-footer`** (jobbra igazítva): `btn-sm btn-outline-secondary` Szerkesztés (`bi-pencil`) és
     `btn-sm btn-outline-danger` Törlés (`bi-trash`) gomb.

   A kitöltendő elemeket **osztállyal** jelöld (pl. `satellite-name`), ne `id`-val, mert a sablon többször klónozódik.
7. **Modal** (`#edit-modal`, a `<main>`-en kívül). Az űrlap legyen maga a `modal-content` (`<form id="edit-form">`).
   - A fejlécben a cím (`#modal-title`) és bezárógomb van.
   - A törzsben egy rejtett `#field-id` mező, és a lenti mezők `form-floating` csoportokban. A pályamagasság és a tömeg
     egy sorban legyen (`row g-2`, két `col`).
   - A mezők alatt egy rejtett `#modal-error` (`alert alert-danger`).
   - A láblécben három gomb (mind `type="button"`): „Mégse” (`btn-outline-secondary`, bezárja a modalt), „Létrehozás”
     (`#add-btn`, `btn-success`, `bi-floppy`) és „Módosítás” (`#update-btn`, `btn-warning`, `bi-pencil`, alapból `d-none`).

   | `id` | Vezérlő | Megjegyzés |
   | --- | --- | --- |
   | `field-name` | `form-control` szöveg | kötelező |
   | `field-targetId` | `form-select` | a HTML-ben üres, az opciókat JS-ből a lookupból töltsd fel |
   | `field-altitudeKm` | `form-control` szám | Pályamagasság (km), > 0 |
   | `field-massKg` | `form-control` szám | Tömeg (kg), > 0 |
   | `field-launchYear` | `form-control` szám | Indítás éve, 1957–2100 |
   | `field-instruments` | `form-control` szöveg | Műszerek, vesszővel elválasztva |
   | `field-operational` | `form-check form-switch` | Működik |

8. **Bónuszhoz (lásd lent):** a rács alá egy „Kategóriák pályamagasság szerint” című szakasz, benne három
   `card` egy `row-cols-md-3` rácsban:

   | Kártya | Keret / fejléc | Lista `id` |
   | --- | --- | --- |
   | LEO (< 2000 km) | `border-success` / `text-bg-success` | `category-leo` |
   | MEO (2000–35785 km) | `border-warning` / `text-bg-warning` | `category-meo` |
   | GEO (≥ 35786 km) | `border-danger` / `text-bg-danger` | `category-geo` |

   A `card-header` alatt egy üres `list-group list-group-flush` lista legyen.

### Skeleton

A modal kerete (a mezőket és a gombokat neked kell beletenni):

```html
<div class="modal fade" id="edit-modal" tabindex="-1" aria-labelledby="modal-title" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable">
    <form id="edit-form" class="modal-content" novalidate>
      <div class="modal-header">
        <h2 class="modal-title h5" id="modal-title">Új műhold</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Bezárás"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="field-id" />
        <!-- mezők -->
      </div>
      <div class="modal-footer">
        <!-- Mégse, Létrehozás, Módosítás -->
      </div>
    </form>
  </div>
</div>
```

### Ellenőrző lista

- [ ] A felület JavaScript nélkül is megjelenik: a statisztikában `–` látszik, és működik az eszköztár meg a modal kerete.
- [ ] Mobil méretben minden egy oszlopba rendeződik, nincs vízszintes görgetés.
- [ ] Sötét és világos témában is olvasható (a navbar téma-gombjával kipróbálva).
- [ ] Nincs `style`, `<style>` és saját `.css` a mappában.

---

## 📌 2. Modulfájlok (5 pont)

Töltsd ki a kapott fájlokat ES modulként (`import`/`export`). Az osztályok már léteznek és exportálva vannak; a modellosztály és a `Logic` API-címei készen vannak, a többi hiányzik:

| Fájl | Tartalom |
| --- | --- |
| `satellite.js` | **kész:** a `Satellite` modellosztály a mezőivel (az API szerint), nem kell módosítani |
| `satellite-utils.js` | tiszta segédfüggvények: rendezés, kategorizálás, számformázás (DOM és `fetch` nélkül) |
| `logic.js` | `Logic` osztály: az API-címek készen vannak; ezek mellé kerülnek az adatok, az API-hívások és a statisztika (DOM nélkül) |
| `renderer.js` | `Renderer` osztály: minden DOM-művelet (`fetch` nélkül) |
| `app.js` | belépési pont: példányosít és elindítja az első betöltést |

A felépítés kövesse az órai **`09-javascript-api/developer-crud-complex`** példát: a `Logic` tárolja az API-címeket és az
adatokat, a konstruktorában köti be a `Renderer` eseményeit, a belső segédmetódusai (törlés, szerkesztésre kiválasztás,
statisztikák, kérésküldés, GUID-generálás) pedig **privát metódusok** (`#`). A `Renderer` olvassa ki, tölti ki és üríti
az űrlapot, és ő rajzolja ki a statisztikát meg a kártyákat. Minden osztály és metódus kapjon **JSDoc**-kommentet.

## 📌 3. Betöltés az API-ról (15 pont)

1. Az oldal betöltésekor a műholdak és az égitest-lookup **egyszerre, `Promise.all`-lal** töltődjön be, `async`/`await`-tel.
2. Betöltés közben látszódjon a `#loading` spinner, utána tűnjön el.
3. Hiba esetén jelenjen meg az `#error-alert`, és **szerepeljen benne a HTTP-státuszkód**, pl. „Nem sikerült betölteni az adatokat (HTTP 500)”.
4. Az **Újratöltés** gomb csak a műholdak listáját töltse újra (`getSatellites`, a lookupot nem), **`.then()` lánccal** megírva:
   státuszkód-ellenőrzés, JSON feldolgozása, kirajzolás, hiba esetén `.catch()`.
5. A **Visszaállítás** gomb megerősítés (`confirm`) után hívja a `reset` végpontot, majd töltse újra az adatokat.

## 📌 4. Megjelenítés sablonból (15 pont)

1. Minden műholdhoz **klónozd** a `#card-template` sablont (`content.cloneNode(true)`), töltsd ki, és tedd a `#target` rácsba.
2. A fejlécben az **égitest neve** álljon (nem az `id`-ja, a lookupból kell kikeresni).
3. Állapot `badge`: „működik” `text-bg-success`, egyébként „leállt” `text-bg-secondary`.
4. A műszerek `badge rounded-pill text-bg-light border` jelvényekként jelenjenek meg.
5. A pályamagasság „540 km”, a tömeg „11 110 kg” formában jelenjen meg (`toLocaleString("hu-HU")`), az indítás éve számként.
6. Üres listánál a rács helyett a `#empty-message` látszódjon.

## 📌 5. Létrehozás, szerkesztés, törlés (20 pont)

1. Az **Új műhold** gomb üres modalt nyit „Új műhold” címmel. Ilyenkor csak a **Létrehozás** gomb látszik, és a
   „Működik” kapcsoló alapból be van kapcsolva.
2. A **Szerkesztés** gomb ugyanezt a modalt nyitja meg kitöltve, „Műhold szerkesztése” címmel. Ilyenkor csak a
   **Módosítás** gomb látszik, és a módosítandó elem `id`-ja a rejtett `#field-id` mezőbe kerül.
3. **Létrehozás:** a kliens generál GUID-ot, és `POST` kérés megy ki. **Módosítás:** az `id` alapján `PUT` kérés megy ki.
   A számmezők számként, a műszerek tömbként kerüljenek az objektumba.
4. A helyi tömb **csak sikeres válasz után** változzon. Ezután a modal bezárul, és a lista meg a statisztika frissül.
5. Ha a szerver hibával válaszol, a `#modal-error` mutasson hibaüzenetet a HTTP-státuszkóddal. A modal ilyenkor maradjon nyitva.
6. A **Törlés** gomb megerősítés (`confirm`) után küldje el a `DELETE` kérést.

## 📌 6. Statisztika (10 pont)

| `id` | Tartalom | Kötelező tömbmetódus |
| --- | --- | --- |
| `stat-operational-ratio` | a működő műholdak aránya egészre kerekített százalékban, pl. „80%” | `filter` |
| `stat-total-mass` | az össztömeg kilogrammban és tonnában, pl. „38 884 kg (38,9 t)” | `reduce` |
| `stat-oldest` | a legkorábban indított műhold neve és indítási éve, pl. „Hubble űrtávcső (1990)” | `reduce` |

A `find` metódust a kikereséseknél használd: a szerkesztendő műhold megkeresésénél és az égitest nevének
kikeresésénél (4/2. pont). Minden változás után frissüljön a statisztika.

## 📌 7. Rendezés (5 pont)

A `#sort-select` választásakor a lista **egy másolat rendezésével** jelenjen meg, az eredeti tömb nem módosulhat.
Mindhárom rendezési szempontot külön kezeld (név: `localeCompare`, pályamagasság és indítás éve: kivonás).
A választás a `localStorage` `satellites-sort` kulcsára kerüljön, és oldalfrissítés után is maradjon meg.

## 📌 8. Tömeges módosítás (5 pont)

A **15 évnél régebbiek leállítása** gomb megerősítés (`confirm`) után állítsa le (`operational: false`) az összes olyan
műholdat, amely még működik, és az indítása óta több mint 15 év telt el (az aktuális évhez képest; `filter` + `map`).
A `PUT` kérések **párhuzamosan, `Promise.all`-lal** menjenek ki, és ha mind sikeres volt, töltsd újra az adatokat.

## 📌 9. Debug-mini (5 pont)

Nyisd meg a `debug/index.html`-t. A `debug/buggy.js` két függvénye hibás. **Breakpointtal** (DevTools → Sources)
derítsd ki a hibák okát, javítsd ki őket úgy, hogy a táblázat minden sora zöld legyen, és töltsd ki a `debug/DEBUG.md`-t.
Hibánként írd le a tünetet, azt, hogy mit láttál a breakpointnál, mi volt az ok, és mi a javítás.

## ⭐ Bónusz: kategorizálás (10 pont)

Az 1/8. pontban elkészített három kártya listájába (`li.list-group-item`) kerüljenek a műholdak nevei a pályamagasságuk
szerint (`filter`). Minden változás után frissüljön.

---

## 📌 Kódminőség és dokumentáció

- JSDoc minden osztályon és metóduson (paraméterek, visszatérési érték).
- Tiszta munkamegosztás: a `Logic` dönt és számol, a `Renderer` rajzol, az `*-utils.js` tiszta függvényeket tartalmaz.
- Beszédes nevek, nincs duplikált kód (a `fetch` hibakezelése egy helyen legyen).
- Hiba nélküli konzol.

## 📌 Ellenőrzés és tesztelés

- **Network panel:** betöltéskor két `GET` kérés induljon párhuzamosan. Tömeges módosításnál annyi `PUT` menjen ki, ahány leállítandó műhold van.
- Írd átmenetileg a saját lekérésed URL-je mögé a `?fail=true`-t, illetve a `?delay=3000`-et: megjelenik-e a hiba, illetve a spinner?
- Hibás adat (pl. negatív tömeg vagy 1950-es indítási év): megjelenik-e a `400`-as hiba a modalban?
- A tömeges leállítás után a működő arány csökken-e, és a leállított műholdak kártyáján „leállt” látszik-e?
- Rendezés után oldalfrissítés: megmaradt-e a választás?
- A végén a **Visszaállítás** gombbal állítsd vissza az adatokat.

## 🎯 Elvárt eredmény

Egy, a többi modullal egységes kinézetű Műholdak oldal, amely Bootstrap-kártyákon jeleníti meg a saját API adatait.
Listáz, létrehoz, szerkeszt, töröl, három statisztikát mutat, a rendezése menthető, és a tömeges leállítást egyszerre
küldi el. Ehhez jön a kitöltött `DEBUG.md`, egy PR a `main`-re, és a merge után a modul az éles oldalon is fut.
