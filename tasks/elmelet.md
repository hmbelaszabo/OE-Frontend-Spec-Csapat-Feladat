# 🧠 Elméleti kérdések (bónusz)

Rövid, ZH-szerű kérdések a 07–09. hét anyagából. Előbb próbálj meg magadtól válaszolni, és csak utána nyisd le a választ.

## 07 – Engine, runtime, debug

1. Mi a különbség a JavaScript **engine** és a **runtime** között? Mondj egy-egy példát.
   <details><summary>Válasz</summary>Az engine (pl. V8, SpiderMonkey) értelmezi és futtatja a JS-kódot: parser, interpreter, JIT, call stack, heap. A runtime az a környezet, amely az engine köré API-kat ad (böngésző: DOM, `fetch`, `setTimeout`; Node.js: `fs`, `process`), és ide tartozik az event loop és a callback queue is.</details>
2. Mit ír ki a konzol, és miért?
   ```js
   console.log("A")
   setTimeout(() => console.log("B"), 0)
   Promise.resolve().then(() => console.log("C"))
   console.log("D")
   ```
   <details><summary>Válasz</summary><code>A D C B</code>. A szinkron kód fut le először. A Promise-callback a <b>microtask</b> queue-ba kerül, ez minden makrotaszk (pl. <code>setTimeout</code>) előtt kiürül, még akkor is, ha az időzítő 0 ms.</details>
3. Mi a **hoisting**? Mi a különbség a `var`, illetve a `let`/`const` között ebből a szempontból?
   <details><summary>Válasz</summary>A deklarációk a hatókörük elejére „emelődnek”. A <code>var</code> <code>undefined</code> értékkel inicializálódik, ezért deklaráció előtt is olvasható. A <code>let</code>/<code>const</code> is emelődik, de a deklarációig a <b>TDZ</b>-ben (temporal dead zone) van, és ha előtte olvasod, <code>ReferenceError</code>-t kapsz. A függvénydeklaráció törzsestül emelődik.</details>
4. Mi az **execution context**, és mi kerül a **call stackre**?
   <details><summary>Válasz</summary>Az execution context a kód futási környezete: a változók, a <code>this</code> értéke és a külső hatókörre mutató hivatkozás. Indításkor létrejön a globális kontextus, majd minden függvényhíváskor egy új, és ez a call stack tetejére kerül. Amikor a függvény visszatér, a kontextusa lekerül a stackről.</details>
5. Mire való a **breakpoint**, a **Scope** és a **Call Stack** panel a DevToolsban?
   <details><summary>Válasz</summary>A breakpoint megállítja a futást egy adott soron. A Scope panel ekkor megmutatja a helyi, a closure- és a globális változók aktuális értékét, a Call Stack pedig azt, hogy milyen hívási láncon jutott el ide a program. Innen lépésenként (step over/into/out) lehet továbbhaladni.</details>

## 08 – Modulok, tömbmetódusok, PE/GD

6. Mi a különbség a **named** és a **default export** között?
   <details><summary>Válasz</summary>Named exportból egy modulban több is lehet, és importálni ugyanazzal a névvel kell, kapcsos zárójelben: <code>import { a } from "./x.js"</code>. Default exportból egy modulban csak egy lehet, és importáláskor tetszőleges nevet kaphat: <code>import x from "./x.js"</code>.</details>
7. Miért kell `[...tomb].sort(...)`-ot írni a `tomb.sort(...)` helyett, ha az eredeti sorrendet meg akarjuk tartani?
   <details><summary>Válasz</summary>A <code>sort</code> helyben rendez, tehát módosítja az eredeti tömböt. A spread egy sekély másolatot készít, és azt rendezzük (alternatíva: <code>toSorted()</code>).</details>
8. Mi a különbség a `find` és a `filter`, illetve a `some` és az `every` között? Mit ad vissza a `some` és az `every` üres tömbre?
   <details><summary>Válasz</summary>A <code>find</code> az első találatot adja vissza (vagy <code>undefined</code>-ot), a <code>filter</code> az összes találatot egy új tömbben. A <code>some</code> akkor igaz, ha legalább egy elem megfelel, az <code>every</code> akkor, ha mindegyik. Üres tömbre a <code>some</code> <code>false</code>, az <code>every</code> <code>true</code>.</details>
9. Mi a **progressive enhancement** és a **graceful degradation**? Hol jelenik meg a projektben?
   <details><summary>Válasz</summary>Progressive enhancement: egy működő alapból indulunk (HTML), és erre építünk rá extrákat (JS). Graceful degradation: a teljes élményből indulunk, és azt biztosítjuk, hogy hiányzó képességek mellett is használható maradjon. A projektben ilyen a <code>&lt;noscript&gt;</code> üzenet, a főoldal JS nélkül is működő linkjei és a hibás API esetén megjelenő hibaüzenet az összeomlás helyett.</details>

## 09 – Promise, async/await, fetch

10. Milyen állapotai vannak egy **Promise**-nak?
    <details><summary>Válasz</summary><code>pending</code> (függőben), <code>fulfilled</code> (teljesült) és <code>rejected</code> (elutasított). Ha egyszer eldőlt (settled), az állapota már nem változik.</details>
11. Miért nem dob a `fetch` hibát egy `404`-es válasznál? Mit kell ehelyett tenni?
    <details><summary>Válasz</summary>A <code>fetch</code> csak hálózati hiba esetén utasítja el a Promise-t. Egy HTTP-hibakód is „sikeres” válasznak számít, ezért a <code>response.ok</code> (vagy a <code>response.status</code>) értékét kell ellenőrizni, és szükség esetén mi magunk dobunk hibát.</details>
12. Mi történik a `Promise.all`-lal, ha az egyik Promise elutasítódik? Mi a különbség a `Promise.allSettled`-hez képest?
    <details><summary>Válasz</summary>A <code>Promise.all</code> az első elutasításnál azonnal elutasítódik, ezzel a hibával (a többi kérés ettől még lefut, csak az eredményük elveszik). Az <code>allSettled</code> megvárja mindet, és minden kérésről egy <code>{ status, value | reason }</code> objektumot ad vissza.</details>
13. Írd át fejben `.then()` láncra: `const r = await fetch(url); const d = await r.json(); show(d)`.
    <details><summary>Válasz</summary><code>fetch(url).then(r =&gt; r.json()).then(d =&gt; show(d)).catch(e =&gt; …)</code>. A <code>then</code>-ből visszaadott Promise-ra a lánc következő tagja vár.</details>
14. Miért kell a `POST`/`PUT` kérésnél a `Content-Type: application/json` fejléc és a `JSON.stringify`?
    <details><summary>Válasz</summary>A <code>body</code> csak szöveg (vagy bináris adat) lehet, ezért az objektumot JSON-szöveggé kell alakítani. A fejlécből tudja a szerver, hogy JSON-ként kell feldolgoznia. Ha hiányzik, a szerver nem olvassa be a törzset.</details>
