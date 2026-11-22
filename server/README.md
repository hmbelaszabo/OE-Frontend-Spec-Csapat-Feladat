# 🌐 Űrügynökség API

> A backend kész, a csapat nem módosítja. Ez a fájl az API-szerződés: ebből dolgozz.

- **Éles alapcím:** `https://<projekt>.vercel.app/api` · **lokálisan:** `http://localhost:3000/api` (`npm run dev`)
- Minden modulnak **saját, elszigetelt adattára** van (`/api/<modul>/…`). A lookup-végpontok csak olvashatók.
- Kérés- és választörzs: JSON (`Content-Type: application/json`). CORS: bármely originről hívható.
- Egészség-ellenőrzés: `GET /api/health` → `{ "status": "ok", "store": "memory" | "redis" }`

## Közös végpontok modulonként

| Végpont | Metódus | Body | Siker | Hibák |
| --- | --- | --- | --- | --- |
| `/api/<modul>/get<Többes>` | GET | – | `200` tömb | – |
| `/api/<modul>/create<Egyes>` | POST | teljes objektum, kliens-GUID `id` | `201` az objektum | `400`, `409` (létező id / 50 elemes korlát) |
| `/api/<modul>/update<Egyes>` | PUT | teljes objektum | `200` az objektum | `400`, `404` |
| `/api/<modul>/delete<Egyes>` | DELETE | `{ "id": "…" }` | `200` `{ "id": "…" }` | `400`, `404` |
| `/api/<modul>/reset` | POST | – | `200` a kezdő tömb | – |

Az `id` GUID formátumú: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (hexadecimális). Ismeretlen mező esetén `400`.

## Hibaformátum

```json
{ "error": "Validation failed", "fields": { "budget": "must be a positive number" } }
```

Egyéb: `{ "error": "Item not found" }` (404) · `{ "error": "Invalid JSON body" }` (400) · `{ "error": "Body too large (max 10 kB)" }` (413) · `500`.

## Szimuláció

| Paraméter | Hatás |
| --- | --- |
| `?delay=2000` | a válasz ennyi ms-mal később érkezik (max. 5000) – spinner teszteléséhez |
| `?fail=true` | mindig `500` `{ "error": "Simulated failure (?fail=true)" }` – hibakezelés teszteléséhez |

---

## 🛰️ Küldetések – `/api/missions`

| Végpont | Metódus |
| --- | --- |
| `/api/missions/getMissions` | GET |
| `/api/missions/createMission` | POST |
| `/api/missions/updateMission` | PUT |
| `/api/missions/deleteMission` | DELETE |
| `/api/missions/reset` | POST |
| `/api/missions/getRocketOptions` | GET – **lookup:** rakéták `{ id, name }` – a `rocketId` csak ezek közül lehet |

**Szabályok:** `name` 1–100 karakter · `rocketId` a lookupból · `budget` > 0 (millió $) · `durationDays` pozitív egész · `launchDate` `YYYY-MM-DD` · `successful` bool · `objectives` max. 10 szöveg

```json
{
  "id": "dbd3388b-ea4a-4bb6-93db-c0c860b6d1c1",
  "name": "Artemis I",
  "rocketId": "670076a4-f739-4469-b39a-e64c54f138a2",
  "budget": 4100,
  "durationDays": 25,
  "launchDate": "2022-11-16",
  "successful": true,
  "objectives": [
    "Orion hőpajzs tesztje",
    "Holdkerülés"
  ]
}
```

Lookup-elem (`getRocketOptions`):

```json
{
  "id": "c76faa65-53c4-4c97-b875-e5737a40e5ed",
  "name": "Falcon 9"
}
```

---

## 👩‍🚀 Asztronauták – `/api/astronauts`

| Végpont | Metódus |
| --- | --- |
| `/api/astronauts/getAstronauts` | GET |
| `/api/astronauts/createAstronaut` | POST |
| `/api/astronauts/updateAstronaut` | PUT |
| `/api/astronauts/deleteAstronaut` | DELETE |
| `/api/astronauts/reset` | POST |
| `/api/astronauts/getMissionOptions` | GET – **lookup:** küldetések `{ id, name }` – a `missionId` ezek egyike vagy `null` |

**Szabályok:** `name` 1–100 · `nationality` 1–40 · `age` egész 18–80 · `flightHours` ≥ 0 · `isCommander` bool · `missionId` a lookupból vagy `null` · `skills` max. 10 szöveg · `image` URL vagy `""`

```json
{
  "id": "68f073f9-bda1-4ffd-a619-396c0cd4a7d7",
  "name": "Reid Wiseman",
  "nationality": "amerikai",
  "age": 50,
  "flightHours": 3960,
  "isCommander": true,
  "missionId": "57f43292-c25b-4abe-847a-60b3f709a614",
  "skills": [
    "pilóta",
    "űrséta"
  ],
  "image": ""
}
```

Lookup-elem (`getMissionOptions`):

```json
{
  "id": "57f43292-c25b-4abe-847a-60b3f709a614",
  "name": "Artemis II"
}
```

---

## 🚀 Rakéták – `/api/rockets`

| Végpont | Metódus |
| --- | --- |
| `/api/rockets/getRockets` | GET |
| `/api/rockets/createRocket` | POST |
| `/api/rockets/updateRocket` | PUT |
| `/api/rockets/deleteRocket` | DELETE |
| `/api/rockets/reset` | POST |
| `/api/rockets/getLaunches` | GET – **lookup:** indítások `{ id, rocketId, date, success }` – indítások száma, sikerességi arány |

**Szabályok:** `name` 1–100 · `manufacturer` 1–60 · `payloadTons` > 0 · `stages` egész 1–5 · `reusable` bool · `costPerLaunch` > 0 (millió $) · `image` URL vagy `""`

```json
{
  "id": "010cc6f1-bed5-4dd7-8cd1-765525ae13fe",
  "name": "Falcon 9",
  "manufacturer": "SpaceX",
  "payloadTons": 22.8,
  "stages": 2,
  "reusable": true,
  "costPerLaunch": 67,
  "image": ""
}
```

Lookup-elem (`getLaunches`):

```json
{
  "id": "9bdb9e2f-c6ad-4aec-bae9-d2e801e3e123",
  "rocketId": "010cc6f1-bed5-4dd7-8cd1-765525ae13fe",
  "date": "2022-01-10",
  "success": false
}
```

---

## 🪐 Célpontok – `/api/targets`

| Végpont | Metódus |
| --- | --- |
| `/api/targets/getTargets` | GET |
| `/api/targets/createTarget` | POST |
| `/api/targets/updateTarget` | PUT |
| `/api/targets/deleteTarget` | DELETE |
| `/api/targets/reset` | POST |
| `/api/targets/getVisits` | GET – **lookup:** látogatások `{ id, targetId, mission, year }` – hány küldetés járt ott |

**Szabályok:** `name` 1–100 · `type` `planet` / `moon` / `asteroid` · `distanceMkm` ≥ 0 (millió km) · `avgTempC` ≥ −273.15 · `habitable` bool · `moons` egész ≥ 0 · `gravity` ≥ 0 (g)

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

Lookup-elem (`getVisits`):

```json
{
  "id": "4265f446-09bc-46c8-b3e1-69bccc9bcb10",
  "targetId": "a7536fd3-6047-4727-90db-f3a320542bfb",
  "mission": "MESSENGER",
  "year": 2011
}
```

---

## 📡 Műholdak – `/api/satellites`

| Végpont | Metódus |
| --- | --- |
| `/api/satellites/getSatellites` | GET |
| `/api/satellites/createSatellite` | POST |
| `/api/satellites/updateSatellite` | PUT |
| `/api/satellites/deleteSatellite` | DELETE |
| `/api/satellites/reset` | POST |
| `/api/satellites/getTargetOptions` | GET – **lookup:** égitestek `{ id, name }` – a `targetId` csak ezek közül lehet |

**Szabályok:** `name` 1–100 · `targetId` a lookupból · `altitudeKm` > 0 · `massKg` > 0 · `launchYear` egész 1957–2100 · `operational` bool · `instruments` max. 10 szöveg

```json
{
  "id": "fc6725f8-7e2a-4a5d-be7a-bf6d139de89d",
  "name": "Hubble űrtávcső",
  "targetId": "5126aa7b-35a7-4093-bad9-1ec0da8e0c05",
  "altitudeKm": 540,
  "massKg": 11110,
  "launchYear": 1990,
  "operational": true,
  "instruments": [
    "WFC3",
    "COS",
    "STIS"
  ]
}
```

Lookup-elem (`getTargetOptions`):

```json
{
  "id": "5126aa7b-35a7-4093-bad9-1ec0da8e0c05",
  "name": "Föld"
}
```
