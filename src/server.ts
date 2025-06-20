import express from "express";
import cors from "cors"
import type { Express } from "express";

const app: Express = express()

app.use(cors())


export {app}