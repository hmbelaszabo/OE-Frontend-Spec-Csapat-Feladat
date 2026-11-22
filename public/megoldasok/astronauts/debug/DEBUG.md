# 🐞 Debug-jegyzőkönyv – Asztronauták

> **[MEGOLDÁS]** A `main`-en ez a fájl csak a sablont tartalmazza (a négy kérdést üres válaszokkal).

## 1. `countCommanders`

- **Tünet:** a várt 1 helyett 3 az eredmény, ráadásul utána minden asztronauta `isCommander` értéke `true`.
- **Breakpoint és megfigyelés:** az `if` sor előtt a Scope panel szerint B-nél `isCommander: false`, a sor után már `true`, vagyis maga a feltétel írja át az értéket.
- **Ok:** a feltételben értékadás (`=`) szerepel összehasonlítás (`===`) helyett. Az értékadás eredménye `true`, ezért minden kör számol, és közben az adatot is elrontja.
- **Javítás:** `if (astronaut.isCommander)` (vagy `=== true`).

## 2. `crewReport.labels`

- **Tünet:** `TypeError: Cannot read properties of undefined (reading 'prefix')`.
- **Breakpoint és megfigyelés:** a `map` callbackjében a Scope panel szerint `this` értéke `undefined`, a `labels` metódusban viszont még a `crewReport` objektum. A Call Stack-ben a callbacket a `map` hívja, nem az objektum.
- **Ok:** a hagyományos `function` saját `this`-t kap a hívás módjától függően; a `map` sima függvényként hívja, és strict módban ilyenkor a `this` értéke `undefined`.
- **Javítás:** nyílfüggvény (`astronaut => …`), amely a környező `this`-t használja; vagy a `map` második paraméterében átadott `this`.
