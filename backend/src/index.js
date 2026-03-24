import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import testCaseRoutes from "./routes/testCaseRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", testCaseRoutes);
app.use("/api", exportRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});