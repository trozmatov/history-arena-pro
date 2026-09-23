/**
 * History Arena PRO - Test Management & Google Forms Backend Server
 * Run: node server/index.js
 */

import express from "express";
import cors from "cors";
import { formsRouter } from "./googleFormsController.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/forms", formsRouter);
app.use("/api/tests", formsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "History Arena PRO Tests Engine" });
});

app.listen(PORT, () => {
  console.log(`🚀 History Arena Tests Backend ishga tushdi: http://localhost:${PORT}`);
  console.log(`- Google Forms Import API: POST http://localhost:${PORT}/api/forms/import`);
  console.log(`- Test Save API: POST http://localhost:${PORT}/api/tests/save`);
  console.log(`- Secure Submit API: POST http://localhost:${PORT}/api/tests/:testId/submit`);
});
