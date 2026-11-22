# 🐞 Debug-jegyzőkönyv – Célpontok

> **[MEGOLDÁS]** A `main`-en ez a fájl csak a sablont tartalmazza (a négy kérdést üres válaszokkal).

## 1. `converter.toKelvin`

- **Tünet:** `TypeError: Cannot read properties of undefined (reading 'offset')`.
- **Breakpoint és megfigyelés:** a `map` callbackjében a Scope panel szerint `this` értéke `undefined`. A Call Stack szerint a callbacket a `map` hívja, nem a `converter` objektum.
- **Ok:** a `function` kulcsszavas callback saját `this`-t kap, ami strict módban (ES modul) `undefined`. A `this` tehát elveszett.
- **Javítás:** arrow function kell (`(target) => …`), mert az a külső `this`-t, vagyis a `converter`-t használja. A `map` második paramétereként `this` is átadható.

## 2. `closestThree`

- **Tünet:** a visszaadott nevek helyesek, de utána az eredeti tömb első eleme `Hold` lesz `Mars` helyett.
- **Breakpoint és megfigyelés:** a `sort` sor előtt és után a Scope panelen a `targets` és a `sorted` ugyanarra a tömbre mutat, és a `sort` után a `targets` sorrendje is megváltozott.
- **Ok:** a `sort` helyben rendez (mutál), és ugyanazt a tömböt adja vissza, nem másolatot.
- **Javítás:** a rendezés előtt másolatot kell készíteni (`[...targets].sort(…)` vagy `toSorted`).
