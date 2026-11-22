# 🚀 Űrügynökség – ZH-gyakorló csapatprojekt

Óbudai Egyetem, frontend tárgy – gyakorlás a 2. ZH-ra (06–09. hét: OOP CRUD, debug, ES modulok és tömbmetódusok, Promise / `fetch`).
Öt modul, öt elszigetelt API és egy közös, egységes Bootstrap-kinézet.

**Kezdd itt:** [`tasks/00-kozos.md`](tasks/00-kozos.md), utána a saját modulod feladatleírása.

## 👥 Csapat és modulok

| Modul | Mappa | Feladat | Felelős |
| --- | --- | --- | --- |
| 🛰️ Küldetések | `public/missions/` | [01](tasks/01-missions.md) | `@TODO` |
| 👩‍🚀 Asztronauták | `public/astronauts/` | [02](tasks/02-astronauts.md) | `@TODO` |
| 🚀 Rakéták | `public/rockets/` | [03](tasks/03-rockets.md) | `@TODO` |
| 🪐 Célpontok | `public/targets/` | [04](tasks/04-targets.md) | `@TODO` |
| 📡 Műholdak | `public/satellites/` | [05](tasks/05-satellites.md) | `@TODO` |

Bónusz: [elméleti kérdések](tasks/elmelet.md) · közös Mission Control dashboard a főoldalon.

## ▶️ Futtatás

```bash
npm install
npm run dev        # http://localhost:3000 – az oldal és az API együtt
```

Live Serverrel (`127.0.0.1:5500`) is működik, ha közben fut az `npm run dev` (ld. `public/shared/config.js`).
Az API leírása: [`server/README.md`](server/README.md).

## 🗂️ Szerkezet

```txt
├── .github/            CI/CD workflow-k, CODEOWNERS, PR-sablon
├── api/index.js        Vercel-belépési pont (csak exportálja az Express appot)
├── server/             backend – kész, a csapat nem módosítja (Express 5, Zod, Upstash Redis / memória)
├── public/
│   ├── index.html      főoldal (váz; a Mission Control közös bónuszfeladat)
│   ├── shared/         base.css, theme.js, config.js – közös, kész
│   ├── <modul>/        A FELADAT: közös keret + üres osztályok + debug/ (ezen dolgozol)
│   └── megoldasok/     a minta-megoldások: <modul>/ + index.html, dashboard.js (navbar: „Megoldás” gomb)
├── tasks/              feladatleírások
└── vercel.json
```

## 🔀 Munkafolyamat

1. Saját branch: `feat/<modul>-<rövid-leírás>`. **Csak a saját modulmappádban dolgozz.**
2. PR a `main`-re. A **CI** ellenőrzi, hogy csak egy modulmappát módosítottál-e, nincs-e saját CSS, és szintaktikailag helyes-e a JS. A backend-tesztek is lefutnak.
3. **1 jóváhagyó review** egy csapattárstól + zöld CI → automatikus squash-merge.
4. A `main` frissülése után a `deploy` workflow kiteszi az oldalt Vercelre.

## 🎨 UI-konvenció

Kártya `row-cols-1 row-cols-md-2 row-cols-lg-3` rácsban · statisztika: `card text-center` ·
új: `btn-primary`, szerkesztés: `btn-outline-secondary`, törlés: `btn-outline-danger`, tömeges: `btn-warning` ·
logikai érték: `badge text-bg-success` / `text-bg-secondary` · hiba: `alert-danger` · betöltés: `spinner-border` · **nincs saját CSS**.

## ⚙️ Beállítás (repó-tulajdonos, egyszer)

- **Secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (deploy / preview), `AUTOMERGE_TOKEN`
  (fine-grained PAT, *Contents* és *Pull requests: write* jogosultsággal; GITHUB_TOKEN-nel a merge nem indítaná el a deployt).
- **Repó:** *Allow auto-merge* bekapcsolva; branch protection a `main`-en: kötelező PR, 1 approve, kötelező `ci` checkek, adminra is érvényes.
- **Vercel:** Upstash Redis integráció a projekthez (env változók automatikusan), *Deployment Protection* kikapcsolva a productionön.
