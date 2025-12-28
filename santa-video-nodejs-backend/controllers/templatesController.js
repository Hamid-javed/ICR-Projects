const templateLoader = require('../utils/templateLoader');

const templatesController = {
  // Get all available video templates from JSON file
  getAll: async (req, res) => {
    try {
      const templates = templateLoader.getAllTemplates();

      res.json({
        success: true,
        count: templates.length,
        templates: templates
      });
    } catch (error) {
      console.error('Error reading templates from JSON:', error);
      res.status(500).json({
        error: error.message,
        message: "Failed to load templates from JSON file"
      });
    }
  },

  // Get specific template details by ID
  getById: async (req, res) => {
    try {
      const { templateId } = req.params;

      const template = templateLoader.getTemplateById(templateId);

      if (!template) {
        const allTemplates = templateLoader.getAllTemplates();
        return res.status(404).json({
          error: "Template not found",
          message: `Template with ID '${templateId}' does not exist`,
          availableIds: allTemplates.map(t => t.id)
        });
      }

      res.json({
        success: true,
        template: template
      });
    } catch (error) {
      console.error('Error reading template from JSON:', error);
      res.status(500).json({
        error: error.message,
        message: "Failed to load template from JSON file"
      });
    }
  },

  // Get templates with filtering and search capabilities
  getFiltered: async (req, res) => {
    try {
      const { price_min, price_max, duration_min, duration_max, search } = req.query;

      const templates = templateLoader.filterTemplates({
        price_min,
        price_max,
        duration_min,
        duration_max,
        search
      });

      res.json({
        success: true,
        count: templates.length,
        filters: {
          price_min: price_min || null,
          price_max: price_max || null,
          duration_min: duration_min || null,
          duration_max: duration_max || null,
          search: search || null
        },
        templates: templates
      });
    } catch (error) {
      console.error('Error filtering templates:', error);
      res.status(500).json({
        error: error.message,
        message: "Failed to filter templates"
      });
    }
  },

  // Get template statistics
  getStats: async (req, res) => {
    try {
      const stats = templateLoader.getTemplateStats();

      if (!stats) {
        return res.status(500).json({
          error: "Failed to calculate template statistics"
        });
      }

      res.json({
        success: true,
        stats: stats
      });
    } catch (error) {
      console.error('Error getting template stats:', error);
      res.status(500).json({
        error: error.message,
        message: "Failed to get template statistics"
      });
    }
  }
};

module.exports = templatesController;
