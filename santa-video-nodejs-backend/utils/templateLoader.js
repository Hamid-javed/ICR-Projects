const fs = require('fs');
const path = require('path');

class TemplateLoader {
  constructor() {
    this.templatesPath = path.join(__dirname, '../data/templates.json');
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid() {
    if (!this.cache || !this.cacheTimestamp) {
      return false;
    }
    
    return Date.now() - this.cacheTimestamp < this.cacheExpiry;
  }

  /**
   * Load templates from JSON file with caching
   */
  loadTemplates() {
    try {
      // Return cached data if valid
      if (this.isCacheValid()) {
        return this.cache;
      }

      // Check if file exists
      if (!fs.existsSync(this.templatesPath)) {
        throw new Error(`Templates file not found at: ${this.templatesPath}`);
      }

      // Read and parse file
      const templatesData = fs.readFileSync(this.templatesPath, 'utf8');
      const templates = JSON.parse(templatesData);

      // Validate data
      if (!Array.isArray(templates)) {
        throw new Error('Templates data must be an array');
      }

      // Update cache
      this.cache = templates;
      this.cacheTimestamp = Date.now();

      return templates;
    } catch (error) {
      console.error('Error loading templates:', error.message);
      throw error;
    }
  }

  /**
   * Get all templates
   */
  getAllTemplates() {
    return this.loadTemplates();
  }

  /**
   * Get template by ID
   */
  getTemplateById(id) {
    const templates = this.loadTemplates();
    return templates.find(t => t.id === id);
  }

  /**
   * Filter templates based on criteria
   */
  filterTemplates(filters = {}) {
    let templates = this.loadTemplates();
    const { price_min, price_max, duration_min, duration_max, search } = filters;

    // Apply price filters
    if (price_min !== undefined) {
      templates = templates.filter(t => t.price >= parseFloat(price_min));
    }
    
    if (price_max !== undefined) {
      templates = templates.filter(t => t.price <= parseFloat(price_max));
    }
    
    // Apply duration filters
    if (duration_min !== undefined) {
      templates = templates.filter(t => t.duration >= parseInt(duration_min));
    }
    
    if (duration_max !== undefined) {
      templates = templates.filter(t => t.duration <= parseInt(duration_max));
    }
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm) ||
        t.id.toLowerCase().includes(searchTerm)
      );
    }

    return templates;
  }

  /**
   * Get templates summary statistics
   */
  getTemplateStats() {
    try {
      const templates = this.loadTemplates();
      
      const prices = templates.map(t => t.price);
      const durations = templates.map(t => t.duration);
      
      return {
        total: templates.length,
        price: {
          min: Math.min(...prices),
          max: Math.max(...prices),
          average: prices.reduce((a, b) => a + b, 0) / prices.length
        },
        duration: {
          min: Math.min(...durations),
          max: Math.max(...durations),
          average: durations.reduce((a, b) => a + b, 0) / durations.length
        },
        names: templates.map(t => t.name),
        ids: templates.map(t => t.id)
      };
    } catch (error) {
      console.error('Error getting template stats:', error.message);
      return null;
    }
  }

  /**
   * Clear cache (force reload on next request)
   */
  clearCache() {
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Watch file for changes and clear cache when modified
   */
  watchForChanges() {
    if (fs.existsSync(this.templatesPath)) {
      fs.watchFile(this.templatesPath, (curr, prev) => {
        console.log('Templates file changed, clearing cache...');
        this.clearCache();
      });
    }
  }
}

// Create singleton instance
const templateLoader = new TemplateLoader();

module.exports = templateLoader;
