import express, { Express } from "express";
import dotenv from "dotenv";

import connectToDatabase from "./app/config/database";
import authRoutes from "./app/routes/auth.routes";
import userRoutes from "./app/routes/user.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

(async () => {
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
})();
