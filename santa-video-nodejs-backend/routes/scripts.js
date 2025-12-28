const express = require("express");
const router = express.Router();
const scriptsController = require("../controllers/scriptsController");

// Get all available scripts
router.get("/", scriptsController.getAll);

// Get scripts by category
router.get("/category/:category", scriptsController.getByCategory);

// Get available categories
router.get("/categories", scriptsController.getCategories);

module.exports = router;
