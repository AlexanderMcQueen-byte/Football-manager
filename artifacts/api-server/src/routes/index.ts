import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import playersRouter from "./players";
import tournamentsRouter from "./tournaments";
import fixturesRouter from "./fixtures";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(playersRouter);
router.use(tournamentsRouter);
router.use(fixturesRouter);

export default router;
