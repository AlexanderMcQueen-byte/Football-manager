import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playersRouter from "./players";
import tournamentsRouter from "./tournaments";
import fixturesRouter from "./fixtures";

const router: IRouter = Router();

router.use(healthRouter);
router.use(playersRouter);
router.use(tournamentsRouter);
router.use(fixturesRouter);

export default router;
