import { Request, Response } from "express";

import UserService from "../service/user.service";

export default class UserController {
  constructor(private readonly userService: UserService) {}

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);

      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getUserByAccountNumber = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await this.userService.getUserByAccountNumber(
        req.params.accountNumber
      );

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Error fetching user" });
    }
  };

  getUserByIdentityNumber = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await this.userService.getUserByIdentityNumber(
        req.params.identityNumber
      );

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Error fetching user" });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Error updating user" });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.deleteUser(req.params.id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting user" });
    }
  };
}
