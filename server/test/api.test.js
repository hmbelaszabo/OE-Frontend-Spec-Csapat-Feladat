import { test, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import request from "supertest"
import app from "../app.js"
import { clearMemory } from "../store.js"

beforeEach(() => clearMemory())

/** Modulonként: útvonal-előtag, entitásnév, lookup és egy érvényes új elem. */
const modules = [
  {
    base: "/api/missions", entity: "Mission", plural: "Missions", lookup: "getRocketOptions",
    make: (ref) => ({ name: "Teszt", rocketId: ref, budget: 10, durationDays: 3, launchDate: "2030-01-01", successful: false, objectives: ["a"] })
  },
  {
    base: "/api/astronauts", entity: "Astronaut", plural: "Astronauts", lookup: "getMissionOptions",
    make: (ref) => ({ name: "Teszt", nationality: "magyar", age: 30, flightHours: 0, isCommander: false, missionId: ref, skills: [], image: "" })
  },
  {
    base: "/api/rockets", entity: "Rocket", plural: "Rockets", lookup: "getLaunches",
    make: () => ({ name: "Teszt", manufacturer: "X", payloadTons: 1, stages: 2, reusable: false, costPerLaunch: 5, image: "" })
  },
  {
    base: "/api/targets", entity: "Target", plural: "Targets", lookup: "getVisits",
    make: () => ({ name: "Teszt", type: "asteroid", distanceMkm: 1, avgTempC: 0, habitable: false, moons: 0, gravity: 0.1 })
  },
  {
    base: "/api/satellites", entity: "Satellite", plural: "Satellites", lookup: "getTargetOptions",
    make: (ref) => ({ name: "Teszt", targetId: ref, altitudeKm: 500, massKg: 100, launchYear: 2020, operational: true, instruments: [] })
  }
]

for (const m of modules) {
  test(`${m.base}: teljes CRUD-kör + reset`, async () => {
    const list = await request(app).get(`${m.base}/get${m.plural}`).expect(200)
    assert.ok(list.body.length >= 8, "legalább 8 seed elem")

    const lookup = await request(app).get(`${m.base}/${m.lookup}`).expect(200)
    assert.ok(lookup.body.length > 0)

    const item = { id: randomUUID(), ...m.make(lookup.body[0].id) }
    await request(app).post(`${m.base}/create${m.entity}`).send(item).expect(201)
    await request(app).post(`${m.base}/create${m.entity}`).send(item).expect(409)

    await request(app).put(`${m.base}/update${m.entity}`).send({ ...item, name: "Módosított" }).expect(200)
    const after = await request(app).get(`${m.base}/get${m.plural}`)
    assert.equal(after.body.find((x) => x.id === item.id).name, "Módosított")

    await request(app).delete(`${m.base}/delete${m.entity}`).send({ id: item.id }).expect(200)
    await request(app).delete(`${m.base}/delete${m.entity}`).send({ id: item.id }).expect(404)

    await request(app).delete(`${m.base}/delete${m.entity}`).send({ id: list.body[0].id }).expect(200)
    const reset = await request(app).post(`${m.base}/reset`).expect(200)
    assert.equal(reset.body.length, list.body.length)
  })

  test(`${m.base}: validációs hiba mezőnként`, async () => {
    const res = await request(app).post(`${m.base}/create${m.entity}`).send({ id: "nem-guid", name: "" }).expect(400)
    assert.equal(res.body.error, "Validation failed")
    assert.ok(res.body.fields.id)
    assert.ok(res.body.fields.name)
  })
}

test("hivatkozás ellenőrzése: ismeretlen rocketId → 400", async () => {
  const res = await request(app).post("/api/missions/createMission")
    .send({ id: randomUUID(), ...modules[0].make("nincs-ilyen") }).expect(400)
  assert.ok(res.body.fields.rocketId)
})

test("asztronauta missionId lehet null", async () => {
  await request(app).post("/api/astronauts/createAstronaut")
    .send({ id: randomUUID(), ...modules[1].make(null) }).expect(201)
})

test("?fail=true → 500, ?delay működik", async () => {
  await request(app).get("/api/rockets/getRockets?fail=true").expect(500)
  const start = Date.now()
  await request(app).get("/api/rockets/getRockets?delay=200").expect(200)
  assert.ok(Date.now() - start >= 190)
})

test("hibás JSON → 400, ismeretlen végpont → 404, CORS-fejléc", async () => {
  await request(app).post("/api/rockets/createRocket").set("Content-Type", "application/json").send("{rossz").expect(400)
  const res = await request(app).get("/api/rockets/nincsIlyen").expect(404)
  assert.equal(res.headers["access-control-allow-origin"], "*")
})
