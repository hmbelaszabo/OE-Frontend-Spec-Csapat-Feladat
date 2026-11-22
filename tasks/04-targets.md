# 🪐 Célpontok – ZH-gyakorló feladat

> **Lefedett tananyag:** 06–09. hét (OOP CRUD, debug, ES modulok és tömbmetódusok, Promise / `fetch`)
> **Időkeret:** 120 perc · **Pontszám:** 100 pont + 10 bónuszpont · **Ponthatár:** 50 pont
> **Segédanyag:** az órai anyagok (06–09. mappák), MDN és a Bootstrap dokumentációja
> **Beadás:** PR a `main`-re a saját branchedről (`feat/targets-…`), ld. [`00-kozos.md`](00-kozos.md)

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

Készítsd el az Űrügynökség **Célpontok** oldalát a `public/targets/` mappában. Az oldal a saját API-ról tölti be
a Naprendszer égitestjeit és a hozzájuk tartozó látogatások listáját, Bootstrap-kártyákon jeleníti meg őket, kezeli a
létrehozást, a szerkesztést és a törlést, statisztikát számol, rendez, és egyetlen gombnyomással újraértékeli az égitestek lakhatóságát.

## Fontos követelmények

- **Saját CSS-t és `<style>` blokkot nem írhatsz, és `style=""` attribútumot sem használhatsz** (ezt a CI ellenőrzi). Csak Bootstrap-osztályokat, valamint a közös
  `public/shared/base.css` alábbi osztályait használhatod:

  | Osztály | Hová kerül |
  | --- | --- |
  | `page-icon` | az oldalcím ikonjára (lila, színátmenetes) |
  | `stat-card`, `stat-value` | a statisztika-kártyára, illetve a benne lévő értékre |
  | `entity-card` | a célpont-kártya `card` elemére (hover-effekt) |

- A `Logic` osztály **nem nyúlhat a DOM-hoz**, a `Renderer` osztály **nem hívhat `fetch`-et**.
- A tömbfeladatokat lehetőség szerint **`for` / `while` ciklus nélkül**, tömbmetódusokkal oldd meg, és **az eredeti tömb nem módosulhat**.
- Minden API-hívásnál ellenőrizd a `response.ok` értékét, a hibákat pedig kezeld le.
- Az alábbi **azonosítókat pontosan így használd**, mert a review és a tesztelés ezekre épül.

### Kiinduló állapot

```txt
public/targets/
├── index.html            kész: <head> (Bootstrap, Icons, base.css, theme.js), navbar, ÜRES <main>, footer, script-ek
├── target.js             Target modellosztály a mezőivel (kész)
├── target-utils.js       üres
├── logic.js              Logic osztály – az API-címek már benne vannak (kész), a többi hiányzik
├── renderer.js           üres Renderer osztály (exportálva)
├── app.js                üres – belépési pont (az index.html már betölti modulként)
└── debug/                kész: buggy.js, index.html, DEBUG.md (sablon)
```

> 💡 **Megoldás:** a navbar sárga **Megoldás** gombja a minta-megoldást nyitja meg (`public/megoldasok/targets/`).
> Akkor nézd meg, ha elakadtál, vagy ha a végén össze akarod vetni a sajátoddal. A megoldásból a **Vissza a feladathoz** gombbal jutsz vissza.

A `public/shared/config.js` exportálja az API alapcímét (`API_BASE`). Ezt importáld, és ne írd be kézzel az URL-t.

### API

| Végpont | Metódus | Leírás |
| --- | --- | --- |
| `/api/targets/getTargets` | `GET` | a célpontok listája |
| `/api/targets/createTarget` | `POST` | új célpont (teljes objektum, **a kliens generálja a GUID-ot**) |
| `/api/targets/updateTarget` | `PUT` | célpont módosítása (teljes objektum) |
| `/api/targets/deleteTarget` | `DELETE` | törlés, body: `{ "id": "…" }` |
| `/api/targets/reset` | `POST` | a kezdő adatok visszaállítása |
| `/api/targets/getVisits` | `GET` | **lookup:** látogatások `{ id, targetId, mission, year }` |

Egy célpont:

```json
{
  "id": "a7536fd3-6047-4727-90db-f3a320542bfb",
  "name": "Merkúr",
  "type": "planet",
  "distanceMkm": 77,
  "avgTempC": 167,
  "habitable": false,
  "moons": 0,
  "gravity": 0.38
}
```

Egy látogatás (lookup):

```json
{
  "id": "4265f446-09bc-46c8-b3e1-69bccc9bcb10",
  "targetId": "a7536fd3-6047-4727-90db-f3a320542bfb",
  "mission": "MESSENGER",
  "year": 2011
}
```

Szabályok: `type` értéke `planet`, `moon` vagy `asteroid` · `distanceMkm` ≥ 0 (millió km) · `avgTempC` ≥ −273,15 ·
`moons` nem negatív egész · `gravity` ≥ 0 (g). Hiba esetén `400`, a válasz
`{ "error": "Validation failed", "fields": { "moons": "must not be negative" } }` formájú.

---

## 📌 1. Felület Bootstrap 5-tel (20 pont)

### Felhasznált technikák (03. és 06. hét)

`container`, grid (`row`, `row-cols-*`, `col`, `g-*`), `card` (`card-header`, `card-body`, `card-title`, `card-footer`),
`list-group list-group-flush`, `input-group`, `form-select`, `form-floating`, `form-control`, `form-check form-switch`,
`btn btn-*`, `badge`, `alert`, `spinner-border`, `modal`, `<template>`, Bootstrap Icons, segédosztályok
(`d-flex`, `d-none`, `gap-*`, `ms-auto`, `text-center`, `text-body-secondary`, `h-100`)

### Feladat

A `<main class="container py-4">` elembe, a `<noscript>` alá építsd fel a következőket, ebben a sorrendben:

1. **Oldalfejléc** (`<header>`): `h1` cím `bi-globe-americas` ikonnal (`page-icon` osztály), alatta egy egymondatos,
   halvány (`text-body-secondary`) leírás.
2. **Statisztika-sor:** három oszlop `row row-cols-1 row-cols-md-3 g-3` rácsban. Mindegyik egy
   `card text-center h-100 stat-card` legyen:
   - a `card-header`-ben ikon és felirat (kis, halvány betűvel),
   - a `card-body`-ban egy `stat-value` osztályú elem `–` kezdőértékkel, a lenti id-vel.

   | Felirat | Ikon | Az érték `id`-ja |
   | --- | --- | --- |
   | Legközelebbi célpont | `bi-geo-alt` | `stat-closest` |
   | Átlaghőmérséklet | `bi-thermometer-half` | `stat-avg-temp` |
   | Van lakható célpont? | `bi-tree` | `stat-has-habitable` |

3. **Eszköztár:** egyetlen `card`, a `card-body`-ban egy sorban (`d-flex flex-wrap align-items-center gap-2`):
   - balra egy `input-group`: egy ikon (`bi-sort-down`) és egy `form-select` (`#sort-select`) ezekkel az opciókkal:
     `name-asc` „Név (A–Z)”, `distanceMkm-asc` „Távolság (növekvő)”, `avgTempC-desc` „Hőmérséklet (csökkenő)”;
   - jobbra igazítva (`ms-auto`) négy gomb:

   | `id` | Felirat / ikon | Stílus |
   | --- | --- | --- |
   | `new-btn` | `bi-plus-lg` Új célpont | `btn-primary` |
   | `bulk-btn` | `bi-thermometer-half` Lakhatóság újraértékelése | `btn-warning` |
   | `reload-btn` | csak `bi-arrow-clockwise` ikon, `title="Újratöltés"` | `btn-outline-secondary` |
   | `reset-btn` | csak `bi-arrow-counterclockwise` ikon, `title="Adatok visszaállítása"` | `btn-outline-danger` |

4. **Állapotüzenetek** (alapból mind rejtett, `d-none`):
   - `#loading`: középre igazított `spinner-border` és alatta a „Betöltés…” felirat;
   - `#error-alert`: `alert alert-danger`;
   - `#empty-message`: középre igazított, halvány bekezdés a „Nincs megjeleníthető célpont.” szöveggel.
5. **Kártyarács:** egy üres `#target` elem `row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3` osztályokkal.
6. **Kártyasablon** (`<template id="card-template">`, a `<main>`-en kívül): egy `col`, benne egy `card h-100 entity-card`.
   A tartalom felülről lefelé:
   - **`card-header`** (`d-flex justify-content-between align-items-center`): balra a típus `badge`-e, jobbra a lakhatóság `badge`-e;
   - **`card-body`:** `card-title` (h5 méretű) a névvel;
   - **`list-group list-group-flush`:** öt sor (Távolság `bi-arrows-expand`, Átlaghőmérséklet `bi-thermometer-half`,
     Holdak `bi-moon`, Gravitáció `bi-arrow-down-circle`, Látogatások `bi-flag`). A sorokban balra a halvány felirat
     ikonnal, jobbra félkövéren az érték (`d-flex justify-content-between`);
   - **`card-footer`** (jobbra igazítva): `btn-sm btn-outline-secondary` Szerkesztés (`bi-pencil`) és
     `btn-sm btn-outline-danger` Törlés (`bi-trash`) gomb.

   A kitöltendő elemeket **osztállyal** jelöld (pl. `target-name`), ne `id`-val, mert a sablon többször klónozódik.
7. **Modal** (`#edit-modal`, a `<main>`-en kívül). Az űrlap legyen maga a `modal-content` (`<form id="edit-form">`).
   - A fejlécben a cím (`#modal-title`) és bezárógomb van.
   - A törzsben egy rejtett `#field-id` mező, és a lenti mezők `form-floating` csoportokban. A távolság és az
     átlaghőmérséklet, illetve a holdak száma és a gravitáció páronként egy sorban legyen (`row g-2`, két `col`).
   - A mezők alatt egy rejtett `#modal-error` (`alert alert-danger`).
   - A láblécben három gomb (mind `type="button"`): „Mégse” (`btn-outline-secondary`, bezárja a modalt), „Létrehozás”
     (`#add-btn`, `btn-success`, `bi-floppy`) és „Módosítás” (`#update-btn`, `btn-warning`, `bi-pencil`, alapból `d-none`).

   | `id` | Vezérlő | Megjegyzés |
   | --- | --- | --- |
   | `field-name` | `form-control` szöveg | kötelező |
   | `field-type` | `form-select` | három fix opció: `planet` „bolygó”, `moon` „hold”, `asteroid` „kisbolygó” |
   | `field-distanceMkm` | `form-control` szám | Távolság (millió km), ≥ 0 |
   | `field-avgTempC` | `form-control` szám | Átlaghőmérséklet (°C) |
   | `field-moons` | `form-control` szám | Holdak száma, egész, ≥ 0 |
   | `field-gravity` | `form-control` szám | Gravitáció (g), ≥ 0 |
   | `field-habitable` | `form-check form-switch` | Lakható |

8. **Bónuszhoz (lásd lent):** a rács alá egy „Kategóriák típus szerint” című szakasz, benne három
   `card` egy `row-cols-md-3` rácsban:

   | Kártya | Keret / fejléc | Lista `id` |
   | --- | --- | --- |
   | Bolygók | `border-primary` / `text-bg-primary` | `category-planet` |
   | Holdak | `border-info` / `text-bg-info` | `category-moon` |
   | Kisbolygók | `border-warning` / `text-bg-warning` | `category-asteroid` |

   A `card-header` alatt egy üres `list-group list-group-flush` lista legyen.

### Skeleton

A modal kerete (a mezőket és a gombokat neked kell beletenni):

```html
<div class="modal fade" id="edit-modal" tabindex="-1" aria-labelledby="modal-title" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable">
    <form id="edit-form" class="modal-content" novalidate>
      <div class="modal-header">
        <h2 class="modal-title h5" id="modal-title">Új célpont</h2>
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
| `target.js` | **kész:** a `Target` modellosztály a mezőivel (az API szerint), nem kell módosítani |
| `target-utils.js` | tiszta segédfüggvények: rendezés, kategorizálás, a típus magyar felirata (DOM és `fetch` nélkül) |
| `logic.js` | `Logic` osztály: az API-címek készen vannak; ezek mellé kerülnek az adatok, az API-hívások és a statisztika (DOM nélkül) |
| `renderer.js` | `Renderer` osztály: minden DOM-művelet (`fetch` nélkül) |
| `app.js` | belépési pont: példányosít és elindítja az első betöltést |

A felépítés kövesse az órai **`09-javascript-api/developer-crud-complex`** példát: a `Logic` tárolja az API-címeket és az
adatokat, a konstruktorában köti be a `Renderer` eseményeit, a belső segédmetódusai (törlés, szerkesztésre kiválasztás,
statisztikák, kérésküldés, GUID-generálás) pedig **privát metódusok** (`#`). A `Renderer` olvassa ki, tölti ki és üríti
az űrlapot, és ő rajzolja ki a statisztikát meg a kártyákat. Minden osztály és metódus kapjon **JSDoc**-kommentet.

## 📌 3. Betöltés az API-ról (15 pont)

1. Az oldal betöltésekor a célpontok és a látogatás-lookup **egyszerre, `Promise.all`-lal** töltődjön be, `async`/`await`-tel.
2. Betöltés közben látszódjon a `#loading` spinner, utána tűnjön el.
3. Hiba esetén jelenjen meg az `#error-alert`, és **szerepeljen benne a HTTP-státuszkód**, pl. „Nem sikerült betölteni az adatokat (HTTP 500)”.
4. Az **Újratöltés** gomb csak a célpontok listáját töltse újra (`getTargets`, a lookupot nem), **`.then()` lánccal** megírva:
   státuszkód-ellenőrzés, JSON feldolgozása, kirajzolás, hiba esetén `.catch()`.
5. A **Visszaállítás** gomb megerősítés (`confirm`) után hívja a `reset` végpontot, majd töltse újra az adatokat.

## 📌 4. Megjelenítés sablonból (15 pont)

1. Minden célponthoz **klónozd** a `#card-template` sablont (`content.cloneNode(true)`), töltsd ki, és tedd a `#target` rácsba.
2. A típus-`badge` a magyar feliratot mutassa („bolygó”, „hold”, „kisbolygó”), színe típusonként: bolygó `text-bg-primary`,
   hold `text-bg-info`, kisbolygó `text-bg-warning`.
3. Lakhatóság-`badge`: „Lakható” `text-bg-success`, egyébként „Nem lakható” `text-bg-secondary`.
4. A távolság „54,6 millió km”, a hőmérséklet „-63 °C”, a gravitáció „0.38 g” formában jelenjen meg (a távolság `toLocaleString("hu-HU")`-val).
5. **Látogatások:** a lookupból válogasd ki (`filter`) az adott célpont látogatásait, és írd ki a darabszámukat a legutóbbi
   (legnagyobb évszámú) küldetés nevével és évével, pl. „4 (legutóbb: Perseverance, 2021)”. Ha nincs látogatás:
   „még nem járt ott küldetés”.
6. Üres listánál a rács helyett a `#empty-message` látszódjon.

## 📌 5. Létrehozás, szerkesztés, törlés (20 pont)

1. Az **Új célpont** gomb üres modalt nyit „Új célpont” címmel. Ilyenkor csak a **Létrehozás** gomb látszik.
2. A **Szerkesztés** gomb ugyanezt a modalt nyitja meg kitöltve, „Célpont szerkesztése” címmel. Ilyenkor csak a
   **Módosítás** gomb látszik, és a módosítandó elem `id`-ja a rejtett `#field-id` mezőbe kerül.
3. **Létrehozás:** a kliens generál GUID-ot, és `POST` kérés megy ki. **Módosítás:** az `id` alapján `PUT` kérés megy ki.
   A számmezők számként, a kapcsoló logikai értékként kerüljön az objektumba.
4. A helyi tömb **csak sikeres válasz után** változzon. Ezután a modal bezárul, és a lista meg a statisztika frissül.
5. Ha a szerver hibával válaszol, a `#modal-error` mutasson hibaüzenetet a HTTP-státuszkóddal. A modal ilyenkor maradjon nyitva.
6. A **Törlés** gomb megerősítés (`confirm`) után küldje el a `DELETE` kérést.

## 📌 6. Statisztika (10 pont)

| `id` | Tartalom | Kötelező tömbmetódus |
| --- | --- | --- |
| `stat-closest` | a Földhöz legközelebbi célpont neve és távolsága, pl. „Hold (0,384 M km)” | `reduce` |
| `stat-avg-temp` | az átlaghőmérséklet egy tizedesre kerekítve, pl. „2,7 °C” | `reduce` |
| `stat-has-habitable` | van-e lakható célpont | `some` |

A `find` metódust a kikereséseknél használd: a szerkesztendő célpont megkeresésénél.

A „Van lakható célpont?” értéke „Igen” (`text-success`) vagy „Nem” (`text-danger`) legyen. Minden változás után frissüljön.

## 📌 7. Rendezés (5 pont)

A `#sort-select` választásakor a lista **egy másolat rendezésével** jelenjen meg, az eredeti tömb nem módosulhat.
Mindhárom rendezési szempontot külön kezeld (név: `localeCompare`, távolság és hőmérséklet: kivonás).
A választás a `localStorage` `targets-sort` kulcsára kerüljön, és oldalfrissítés után is maradjon meg.

## 📌 8. Tömeges módosítás (5 pont)

A **Lakhatóság újraértékelése** gomb minden célpontnál számolja újra a lakhatóságot: lakható, ha az átlaghőmérséklete
**−50 és +50 °C között** van (a határokat is beleértve). `PUT` kérés **csak azokra** a célpontokra menjen, amelyeknél az érték
megváltozik (`map` + `filter`). A kérések **párhuzamosan, `Promise.all`-lal** menjenek ki, és ha mind sikeres volt, töltsd újra
az adatokat. (A kezdő adatokon a Hold és a Bennu válik lakhatóvá, így a „Van lakható célpont?” értéke „Igen”-re vált.)

## 📌 9. Debug-mini (5 pont)

Nyisd meg a `debug/index.html`-t. A `debug/buggy.js` két hibát tartalmaz. **Breakpointtal** (DevTools → Sources)
derítsd ki a hibák okát, javítsd ki őket úgy, hogy a táblázat minden sora zöld legyen, és töltsd ki a `debug/DEBUG.md`-t.
Hibánként írd le a tünetet, azt, hogy mit láttál a breakpointnál, mi volt az ok, és mi a javítás.

## ⭐ Bónusz: kategorizálás (10 pont)

Az 1/8. pontban elkészített három kártya listájába (`li.list-group-item`) kerüljenek a célpontok nevei a típusuk
szerint (`filter`). Minden változás után frissüljön.

---

## 📌 Kódminőség és dokumentáció

- JSDoc minden osztályon és metóduson (paraméterek, visszatérési érték).
- Tiszta munkamegosztás: a `Logic` dönt és számol, a `Renderer` rajzol, az `*-utils.js` tiszta függvényeket tartalmaz.
- Beszédes nevek, nincs duplikált kód (a `fetch` hibakezelése egy helyen legyen).
- Hiba nélküli konzol.

## 📌 Ellenőrzés és tesztelés

- **Network panel:** betöltéskor két `GET` kérés induljon párhuzamosan. Tömeges módosításnál csak annyi `PUT` menjen ki, ahány célpont lakhatósága megváltozik.
- Írd átmenetileg a saját lekérésed URL-je mögé a `?fail=true`-t, illetve a `?delay=3000`-et: megjelenik-e a hiba, illetve a spinner?
- Hibás adat (pl. negatív holdszám): megjelenik-e a `400`-as hiba a modalban?
- Ha a tömeges módosítást kétszer egymás után futtatod, a második alkalommal már egy `PUT` sem megy ki?
- Rendezés után oldalfrissítés: megmaradt-e a választás?
- A végén a **Visszaállítás** gombbal állítsd vissza az adatokat.

## 🎯 Elvárt eredmény

Egy, a többi modullal egységes kinézetű Célpontok oldal, amely Bootstrap-kártyákon jeleníti meg a saját API adatait.
Listáz, létrehoz, szerkeszt, töröl, három statisztikát mutat, a rendezése menthető, és a lakhatóság újraértékelését
egyszerre küldi el. Ehhez jön a kitöltött `DEBUG.md`, egy PR a `main`-re, és a merge után a modul az éles oldalon is fut.
