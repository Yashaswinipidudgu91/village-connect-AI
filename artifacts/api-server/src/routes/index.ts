import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resourcesRouter from "./resources";

const router: IRouter = Router();

router.use(healthRouter);
router.use(resourcesRouter);

export default router;
