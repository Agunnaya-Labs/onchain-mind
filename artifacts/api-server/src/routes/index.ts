import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import npcsRouter from "./npcs";
import npcChatRouter from "./npc-chat";
import memoryRouter from "./memory";
import apiKeysRouter from "./api-keys";
import billingRouter from "./billing";
import analyticsRouter from "./analytics";
import indexerRouter from "./indexer";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(npcsRouter);
router.use(npcChatRouter);
router.use(memoryRouter);
router.use(apiKeysRouter);
router.use(billingRouter);
router.use(analyticsRouter);
router.use(indexerRouter);

export default router;
