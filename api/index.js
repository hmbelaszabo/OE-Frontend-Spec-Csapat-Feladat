// Vercel serverless belépési pont: a vercel.json minden /api/* kérést ide irányít.
// A valódi kód a server/ mappában van (az api/ alatti minden .js külön függvény lenne).
import app from "../server/app.js"

export default app
