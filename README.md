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
├── .github/            CODEOWNERS, PR-sablon
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

## 🔀 Munkafolyamat röviden

1. Saját branch: `feat/<modul>-<rövid-leírás>`. **Csak a saját modulmappádban dolgozz.**
2. PR a `main`-re. A Vercel előnézeti deployt csinál, és a linket a PR-ra kommentben kiírja.
3. Ha az előnézeten minden működik, a PR-t te magad merge-eled (**Squash and merge**), review nem kell.
4. A `main` frissülése után a Vercel automatikusan kiteszi az éles oldalt.

A részletes lépéseket a lenti [Git-útmutató](#-git-útmutató) írja le.

## 🎨 UI-konvenció

Kártya `row-cols-1 row-cols-md-2 row-cols-lg-3` rácsban · statisztika: `card text-center` ·
új: `btn-primary`, szerkesztés: `btn-outline-secondary`, törlés: `btn-outline-danger`, tömeges: `btn-warning` ·
logikai érték: `badge text-bg-success` / `text-bg-secondary` · hiba: `alert-danger` · betöltés: `spinner-border` · **nincs saját CSS**.

## ⚙️ Beállítás (repó-tulajdonos, egyszer)

- **Vercel:** a projekt a GitHub-repóból deployol (Git-integráció), minden `main`-push éles, minden PR előnézeti deployt kap.
  A backend Frankfurtban fut (`vercel.json` → `regions: ["fra1"]`), az adatok Upstash Redisben vannak (Storage → Upstash,
  egyedi prefix nélkül, így a `KV_REST_API_URL` és `KV_REST_API_TOKEN` jön létre). *Deployment Protection* kikapcsolva a productionön.
- **GitHub:** *Settings → Branches* → szabály a `main`-re: **Require a pull request before merging** (jóváhagyás nélkül),
  hogy közvetlenül senki ne pusholjon a `main`-re.
- **Collaboratorok:** *Settings → Collaborators* → a csapattagok meghívása (Write jogosultság).

---

## 🧭 Git-útmutató

Minden lépés kétféleképpen szerepel: **parancssorral** és **lazygittel** (`lazygit` a projektmappában). A lazygitben a
számbillentyűk a paneleket váltják (`2` Files, `3` Branches, `4` Commits), a `?` megmutatja az összes billentyűt.

### 1. Egyszeri beállítás

```bash
# név és e-mail (a GitHubon ez látszik a commitok mellett)
git config --global user.name "github-felhasznalonev"
git config --global user.email "<GitHub noreply cím>"   # GitHub: Settings → Emails → „Keep my email addresses private”

# a repó letöltése és a függőségek telepítése
git clone https://github.com/hmbelaszabo/OE-Frontend-Spec-Csapat-Feladat.git
cd OE-Frontend-Spec-Csapat-Feladat
npm install
```

> A noreply címmel a valódi e-mail-címed nem lesz nyilvános. Ha a géped más projektjeihez más e-mail kell,
> a `--global` helyett a repó mappájában `--global` nélkül add ki a `git config` parancsot: akkor csak erre a repóra érvényes.

### 2. Munka megkezdése: friss `main` + saját branch

| Lépés | Parancssor | lazygit |
| --- | --- | --- |
| Váltás a `main`-re | `git switch main` | `3` → `main` → `space` |
| Friss állapot letöltése | `git pull` | `p` |
| Saját branch | `git switch -c feat/rockets-crud` | `3` → `n` → név → Enter |

A branch neve: `feat/<modul>-<rövid-leírás>`, pl. `feat/astronauts-statisztika`.

### 3. Mentés (commit) – sűrűn, kis lépésekben

| Lépés | Parancssor | lazygit |
| --- | --- | --- |
| Mi változott? | `git status` | `2` (Files panel) |
| Egy fájl kijelölése | `git add public/rockets/logic.js` | a fájlon `space` |
| Minden kijelölése | `git add public/rockets/` | `a` |
| Commit | `git commit -m "rockets: betöltés Promise.all-lal"` | `c` → üzenet → Enter |

**Jó commit-üzenet:** `<modul>: mit csináltál`, pl. `astronauts: statisztika reduce-szal`, `missions: modal létrehozás`.
**Ne kerüljön commitba:** más modul mappája, `node_modules/`, `.env`, a szerkesztő ideiglenes fájljai (`*.swp`, `.DS_Store`).

### 4. Feltöltés és Pull Request

| Lépés | Parancssor | lazygit |
| --- | --- | --- |
| Első push (upstream beállítása) | `git push -u origin feat/rockets-crud` | `P` → Enter |
| További push-ok | `git push` | `P` |

Utána a GitHubon: a repó oldalán megjelenik a **Compare & pull request** gomb → base: `main` → cím és leírás
(a PR-sablon ellenőrzőlistáját töltsd ki) → **Create pull request**.

A Vercel-bot pár perc múlva kommentben kiírja az **előnézeti linket**: ott kipróbálható a változtatásod, mielőtt bekerül.

### 5. Merge és utána

- Ha az előnézeten minden működik: a PR alján **Squash and merge** → **Confirm**. Review nem kell.
- A merge után a Vercel 1–2 percen belül frissíti az éles oldalt.
- Takarítás a saját gépeden:

| Lépés | Parancssor | lazygit |
| --- | --- | --- |
| Vissza a `main`-re | `git switch main` | `3` → `main` → `space` |
| Friss `main` | `git pull` | `p` |
| A régi branch törlése | `git branch -d feat/rockets-crud` | `3` → a branchen `d` |

A következő feladathoz új branch kell (2. lépés).

### 6. Ha valami nem úgy megy

| Hiba | Megoldás |
| --- | --- |
| `rejected … (fetch first)` push-nál | Valaki közben feltöltött a branchedre: `git pull --rebase`, utána `git push`. |
| A PR „out of date” a `main`-hez képest | `git switch main && git pull && git switch -` → `git merge main` → `git push`. |
| **Merge conflict** | A jelölt fájlokban (`<<<<<<<`, `=======`, `>>>>>>>`) válaszd ki a jó változatot, töröld a jelöléseket → `git add <fájl>` → `git commit`. lazygitben a fájlon Enter, és a konfliktusblokkok egyenként választhatók. |
| Véletlenül a `main`-en dolgoztam (még nincs commit) | `git switch -c feat/<modul>-…`: a módosítások átjönnek az új branchre. |
| Véletlenül a `main`-re commitoltam (még nincs push) | `git branch feat/<modul>-…` → `git reset --hard origin/main` → `git switch feat/<modul>-…`. |
| Elrontottam egy fájlt, és vissza akarom állítani | `git restore <fájl>` (lazygit: a fájlon `d`). **Ez véglegesen eldobja a nem commitolt módosítást!** |
| Az utolsó commit üzenete rossz (még nincs push) | `git commit --amend -m "új üzenet"` (lazygit: `4` → `r`). |

**Soha ne használd** a `git push --force` parancsot a `main`-en, és ne pusholj közvetlenül a `main`-re: minden a PR-on keresztül megy.
