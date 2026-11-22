# 🐞 Debug-jegyzőkönyv – Küldetések

> **[MEGOLDÁS]** A `main`-en ez a fájl csak a sablont tartalmazza (a négy kérdést üres válaszokkal).

## 1. `averageBudget`

- **Tünet:** az eredmény `NaN` a várt 200 helyett.
- **Breakpoint és megfigyelés:** a ciklusban a Scope panelen az utolsó körben `i === 3`, `missions[i]` `undefined`, ezért `sum` értéke `NaN` lesz.
- **Ok:** off-by-one hiba, a feltétel `i <= missions.length` (az utolsó index `length - 1`).
- **Javítás:** `i < missions.length`, vagy ciklus helyett `reduce`.

## 2. `countUpcoming`

- **Tünet:** mindig 0-t ad vissza.
- **Breakpoint és megfigyelés:** az `if`-nél a Scope panel szerint `limit` értéke `undefined`, pedig a függvény kapott dátumot.
- **Ok:** hoisting. A `var limit` deklarációja a függvény elejére kerül, de az értékadás csak a ciklus után fut le, így a `"2030-01-01" > undefined` összehasonlítás mindig hamis.
  `let`/`const` esetén TDZ miatt `ReferenceError` lenne.
- **Javítás:** a `limit` deklarációját a ciklus elé kell tenni (vagy közvetlenül a `fromDate`-et kell használni).
