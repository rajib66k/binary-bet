import { Router } from "express";
import { healthRoute } from "./health.routes.js";

export const apiRouter = Router();

apiRouter.use(healthRoute);