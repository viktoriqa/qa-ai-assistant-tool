import express from "express";
import {
  generateBasicArtifacts,
  generatePremiumArtifacts
} from "../services/aiService.js";

const router = express.Router();

router.post("/generate-basic", async (req, res) => {
  try {
    const { requirement, requirementType = "web" } = req.body;

    if (!requirement || !requirement.trim()) {
      return res.status(400).json({ error: "Requirement is required." });
    }

    const result = await generateBasicArtifacts({
      requirement,
      requirementType
    });

    res.json(result);
  } catch (error) {
    console.error("Basic generation error:", error);
    res.status(500).json({
      error: "Failed to generate basic test artifacts.",
      details: error.message
    });
  }
});

router.post("/generate-premium", async (req, res) => {
  try {
    const { requirement, requirementType = "web" } = req.body;

    if (!requirement || !requirement.trim()) {
      return res.status(400).json({ error: "Requirement is required." });
    }

    const result = await generatePremiumArtifacts({
      requirement,
      requirementType
    });

    res.json(result);
  } catch (error) {
    console.error("Premium generation error:", error);
    res.status(500).json({
      error: "Failed to generate premium test artifacts.",
      details: error.message
    });
  }
});

export default router;