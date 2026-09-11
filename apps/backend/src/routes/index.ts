import { Router } from "express";
import { marketsRoute } from "./markets.routes.js";
import { agentsRouter } from "./agents.routes.js";
import { authRouter } from "./auth.router.js";

export const apiRouter = Router();

apiRouter.use(marketsRoute);
apiRouter.use(agentsRouter);
apiRouter.use(authRouter);