import express, { Router } from "express";

import UserService from "../service/user.service";
import { auth } from "../middleware/auth.middleware";
import UserController from "../controller/user.controller";

const router: Router = express.Router();
const userService: UserService = new UserService();
const userController: UserController = new UserController(userService);

router.post("/", auth, userController.createUser);
router.get(
  "/account/:accountNumber",
  auth,
  userController.getUserByAccountNumber
);
router.get(
  "/identity/:identityNumber",
  auth,
  userController.getUserByIdentityNumber
);
router.put("/:id", auth, userController.updateUser);
router.delete("/:id", auth, userController.deleteUser);

export default router;
