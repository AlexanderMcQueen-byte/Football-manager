import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import playersRouter from "./players";
import tournamentsRouter from "./tournaments";
import fixturesRouter from "./fixtures";
import registrationsRouter from "./registrations";
import adminRouter from "./admin";
import ratingsRouter from "./ratings";
import inquiriesRouter from "./inquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(playersRouter);
router.use(tournamentsRouter);
router.use(fixturesRouter);
router.use(registrationsRouter);
router.use(adminRouter);
router.use(ratingsRouter);
router.use(inquiriesRouter);

export default router;
