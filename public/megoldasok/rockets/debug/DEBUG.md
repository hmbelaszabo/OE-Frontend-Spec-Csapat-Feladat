# 🐞 Debug-jegyzőkönyv – Rakéták

> **[MEGOLDÁS]** – a `main`-en ez a fájl csak a sablont tartalmazza (a négy kérdés üres válaszokkal).

## 1. `totalPayload`

- **Tünet:** `"020605"` jön vissza a várt `85` helyett.
- **Breakpoint / megfigyelés:** a ciklusban a Scope panelen `total` értéke `0` → `"020"` → `"02060"`, a típusa az első kör után már `string`.
- **Ok:** a `payloadTons` szöveg (űrlapból jön), a `+` operátor szám + szöveg esetén összefűz, nem összead.
- **Javítás:** `total += Number(rocket.payloadTons)` (vagy `reduce` + `Number`).

## 2. `converter.totalInEuro`

- **Tünet:** `TypeError: Cannot read properties of undefined (reading 'rate')`.
- **Breakpoint / megfigyelés:** a `forEach` callbackjében megállva a Scope panelen `this` értéke `undefined`; a Call Stackben a hívó a `forEach`, nem a `converter` objektum.
- **Ok:** a hagyományos `function` saját `this`-t kap, ami a hívás módjától függ; a `forEach` callbackként sima függvényhívással hívja, és `"use strict"` (modul) alatt ilyenkor `this === undefined`.
- **Javítás:** arrow function a callbackben (`(cost) => { sum += cost * this.rate }`), mert az a külső (`totalInEuro`) `this`-ét örökli.
