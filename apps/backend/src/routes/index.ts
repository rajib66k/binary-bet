import { Router } from "express";
import { marketsRoute } from "./markets.routes.js";

export const apiRouter = Router();

apiRouter.use(marketsRoute);