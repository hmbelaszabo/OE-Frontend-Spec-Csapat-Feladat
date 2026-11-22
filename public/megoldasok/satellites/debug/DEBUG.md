# 🐞 Debug-jegyzőkönyv – Műholdak

> **[MEGOLDÁS]** A `main`-en ez a fájl csak a sablont tartalmazza (a négy kérdést üres válaszokkal).

## 1. `massReport.format`

- **Tünet:** `TypeError: Cannot read properties of undefined (reading 'divisor')`.
- **Breakpoint és megfigyelés:** a `map` callbackjében a Scope panel szerint `this` értéke `undefined`. A Call Stackben látszik, hogy a callbacket a `map` hívja, nem a `massReport` objektum.
- **Ok:** a hagyományos `function` saját `this`-t kap, ami a hívás módjától függ. Strict módban (ES modul) ez `undefined`, ezért a `this` elveszik a callbackben.
- **Javítás:** arrow function legyen a callback (`satellite => …`), mert az a külső `format` metódus `this`-ét használja.

## 2. `retirementYear`

- **Tünet:** a várt `2028` helyett `"201315"` az eredmény.
- **Breakpoint és megfigyelés:** a `return` sornál a Scope panel szerint `year` értéke `"2013"` (string), a `lifetimeYears` értéke `15` (number).
- **Ok:** string és szám esetén a `+` összefűz, nem összead. A `trim()` után az érték még mindig szöveg.
- **Javítás:** számmá kell alakítani: `Number(launchYearInput)` (vagy `parseInt`), és csak utána hozzáadni az élettartamot.
