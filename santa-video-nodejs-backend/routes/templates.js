const express = require("express");
const router = express.Router();
const templatesController = require("../controllers/templatesController");

// Get all available video templates
router.get("/", templatesController.getAll);

// Get templates with filtering
router.get("/search", templatesController.getFiltered);

// Get specific template details
router.get("/:templateId", templatesController.getById);

module.exports = router;
