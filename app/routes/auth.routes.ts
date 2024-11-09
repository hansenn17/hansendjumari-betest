import express, { Router } from "express";

import * as authController from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/token", authController.generateToken);

export default router;
