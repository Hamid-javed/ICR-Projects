const fs = require('fs');
const path = require('path');

const scriptsController = {
  // Get all available script segments from JSON file
  getAll: async (req, res) => {
    try {
      const scriptsPath = path.join(__dirname, '../data/scripts.json');
      
      if (!fs.existsSync(scriptsPath)) {
        return res.status(404).json({ 
          error: "Scripts file not found",
          message: "The scripts.json file is missing from the data directory" 
        });
      }

      const scriptsData = fs.readFileSync(scriptsPath, 'utf8');
      const scripts = JSON.parse(scriptsData);
      
      res.json({
        success: true,
        count: scripts.length,
        scripts: scripts
      });
    } catch (error) {
      console.error('Error reading scripts from JSON:', error);
      res.status(500).json({ 
        error: error.message,
        message: "Failed to load scripts from JSON file"
      });
    }
  },

  // Get scripts by category
  getByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      const scriptsPath = path.join(__dirname, '../data/scripts.json');
      
      if (!fs.existsSync(scriptsPath)) {
        return res.status(404).json({ 
          error: "Scripts file not found" 
        });
      }

      const scriptsData = fs.readFileSync(scriptsPath, 'utf8');
      const scripts = JSON.parse(scriptsData);
      
      const filteredScripts = scripts.filter(script => 
        script.category.toLowerCase() === category.toLowerCase()
      );
      
      res.json({
        success: true,
        category: category,
        count: filteredScripts.length,
        scripts: filteredScripts
      });
    } catch (error) {
      console.error('Error filtering scripts by category:', error);
      res.status(500).json({ 
        error: error.message,
        message: "Failed to filter scripts by category"
      });
    }
  },

  // Get available categories
  getCategories: async (req, res) => {
    try {
      const scriptsPath = path.join(__dirname, '../data/scripts.json');
      
      if (!fs.existsSync(scriptsPath)) {
        return res.status(404).json({ 
          error: "Scripts file not found" 
        });
      }

      const scriptsData = fs.readFileSync(scriptsPath, 'utf8');
      const scripts = JSON.parse(scriptsData);
      
      const categories = [...new Set(scripts.map(script => script.category))];
      
      res.json({
        success: true,
        categories: categories
      });
    } catch (error) {
      console.error('Error getting script categories:', error);
      res.status(500).json({ 
        error: error.message,
        message: "Failed to get script categories"
      });
    }
  },

  // Create custom script from selected segments
  create: async (req, res) => {
    try {
      const { segmentIds, goodbyeMessageId, childName, userId } = req.body;

      if (!segmentIds || !Array.isArray(segmentIds) || segmentIds.length === 0) {
        return res.status(400).json({ error: "At least one segment must be selected" });
      }

      const customScript = await scriptService.createCustomScript({
        segmentIds,
        goodbyeMessageId,
        childName,
        userId
      });

      res.json({
        success: true,
        script: customScript,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get custom script by ID
  getCustomScript: async (req, res) => {
    try {
      const { scriptId } = req.params;
      const customScript = await scriptService.getCustomScript(scriptId);
      
      if (!customScript) {
        return res.status(404).json({ error: "Custom script not found" });
      }

      res.json({
        success: true,
        script: customScript,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = scriptsController;
