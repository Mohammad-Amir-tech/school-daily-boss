import { Router, type IRouter } from "express";
import healthRouter from "./health";
import schoolRouter from "./school";
import { schoolContext } from "../middlewares/schoolContext";

const router: IRouter = Router();

router.use(healthRouter);
router.use(schoolContext);
router.use(schoolRouter);

export default router;
