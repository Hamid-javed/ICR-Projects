const Template = require('../models/Template');

class TemplateService {
  async getAllTemplates() {
    try {
      const templates = await Template.find({ isActive: true });
      return templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Failed to fetch templates');
    }
  }

  async getTemplateById(templateId) {
    try {
      const template = await Template.findById(templateId);
      return template;
    } catch (error) {
      console.error('Error fetching template by ID:', error);
      throw new Error('Failed to fetch template');
    }
  }

  async createTemplate(templateData) {
    try {
      const template = new Template(templateData);
      await template.save();
      return template;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create template');
    }
  }

  async updateTemplate(templateId, updateData) {
    try {
      const template = await Template.findByIdAndUpdate(
        templateId, 
        updateData, 
        { new: true }
      );
      return template;
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  }

  async deleteTemplate(templateId) {
    try {
      await Template.findByIdAndUpdate(templateId, { isActive: false });
      return { success: true };
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete template');
    }
  }

  async getTemplatesByCategory(category) {
    try {
      const templates = await Template.find({ 
        category: category, 
        isActive: true 
      });
      return templates;
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw new Error('Failed to fetch templates by category');
    }
  }

  async initializeDefaultTemplates() {
    try {
      const existingCount = await Template.countDocuments();
      if (existingCount > 0) {
        return; // Templates already exist
      }

      const defaultTemplates = [
        {
          name: 'Classic Santa Workshop',
          description: 'Traditional Santa video with cozy workshop background and magical atmosphere',
          previewUrl: '/assets/templates/classic-santa-preview.mp4',
          thumbnail: '/assets/templates/classic-santa-thumb.jpg',
          duration: 120,
          price: 19.99,
          clips: [
            {
              id: 'intro',
              name: 'Workshop Introduction',
              file: '/assets/video-clips/classic-santa-intro.mp4',
              duration: 15,
              type: 'intro',
              hasGreenScreen: false
            },
            {
              id: 'name_mention',
              name: 'Personal Name Mention',
              file: '/assets/video-clips/classic-santa-name.mp4',
              duration: 10,
              type: 'name_mention',
              hasGreenScreen: false
            },
            {
              id: 'green_screen_book',
              name: 'Magic Book with Child Photo',
              file: '/assets/video-clips/classic-santa-book-greenscreen.mp4',
              duration: 20,
              type: 'green_screen_book',
              hasGreenScreen: true,
              greenScreenArea: {
                x: 300,
                y: 200,
                width: 400,
                height: 300
              }
            },
            {
              id: 'custom_message',
              name: 'Custom Script Delivery',
              file: '/assets/video-clips/classic-santa-message.mp4',
              duration: 60,
              type: 'custom_message',
              hasGreenScreen: false
            },
            {
              id: 'goodbye',
              name: 'Farewell Message',
              file: '/assets/video-clips/classic-santa-goodbye.mp4',
              duration: 15,
              type: 'goodbye',
              hasGreenScreen: false
            }
          ],
          nameOverlay: {
            x: 100,
            y: 50,
            fontSize: 48,
            fontColor: '#FFD700',
            fontFamily: 'Arial',
            startTime: 8,
            endTime: 12
          }
        },
        {
          name: 'North Pole Adventure',
          description: 'Santa takes you on an exciting tour of the magical North Pole',
          previewUrl: '/assets/templates/north-pole-preview.mp4',
          thumbnail: '/assets/templates/north-pole-thumb.jpg',
          duration: 150,
          price: 24.99,
          clips: [
            {
              id: 'intro',
              name: 'North Pole Entrance',
              file: '/assets/video-clips/north-pole-intro.mp4',
              duration: 20,
              type: 'intro',
              hasGreenScreen: false
            },
            {
              id: 'name_mention',
              name: 'Personal Greeting',
              file: '/assets/video-clips/north-pole-name.mp4',
              duration: 10,
              type: 'name_mention',
              hasGreenScreen: false
            },
            {
              id: 'green_screen_book',
              name: 'Magical Photo Book',
              file: '/assets/video-clips/north-pole-book-greenscreen.mp4',
              duration: 25,
              type: 'green_screen_book',
              hasGreenScreen: true,
              greenScreenArea: {
                x: 250,
                y: 150,
                width: 450,
                height: 350
              }
            },
            {
              id: 'custom_message',
              name: 'Adventure Story',
              file: '/assets/video-clips/north-pole-message.mp4',
              duration: 80,
              type: 'custom_message',
              hasGreenScreen: false
            },
            {
              id: 'goodbye',
              name: 'Adventure Conclusion',
              file: '/assets/video-clips/north-pole-goodbye.mp4',
              duration: 15,
              type: 'goodbye',
              hasGreenScreen: false
            }
          ],
          nameOverlay: {
            x: 120,
            y: 80,
            fontSize: 52,
            fontColor: '#87CEEB',
            fontFamily: 'Arial',
            startTime: 12,
            endTime: 18
          }
        },
        {
          name: 'Magical Christmas Wonder',
          description: 'Enchanted Christmas experience with spectacular special effects and magic',
          previewUrl: '/assets/templates/magical-preview.mp4',
          thumbnail: '/assets/templates/magical-thumb.jpg',
          duration: 180,
          price: 29.99,
          clips: [
            {
              id: 'intro',
              name: 'Magical Christmas Opening',
              file: '/assets/video-clips/magical-intro.mp4',
              duration: 25,
              type: 'intro',
              hasGreenScreen: false
            },
            {
              id: 'name_mention',
              name: 'Enchanted Name Reveal',
              file: '/assets/video-clips/magical-name.mp4',
              duration: 12,
              type: 'name_mention',
              hasGreenScreen: false
            },
            {
              id: 'green_screen_book',
              name: 'Magical Photo Transformation',
              file: '/assets/video-clips/magical-book-greenscreen.mp4',
              duration: 30,
              type: 'green_screen_book',
              hasGreenScreen: true,
              greenScreenArea: {
                x: 200,
                y: 100,
                width: 500,
                height: 400
              }
            },
            {
              id: 'custom_message',
              name: 'Magical Story with Effects',
              file: '/assets/video-clips/magical-message.mp4',
              duration: 90,
              type: 'custom_message',
              hasGreenScreen: false
            },
            {
              id: 'goodbye',
              name: 'Magical Farewell',
              file: '/assets/video-clips/magical-goodbye.mp4',
              duration: 23,
              type: 'goodbye',
              hasGreenScreen: false
            }
          ],
          nameOverlay: {
            x: 150,
            y: 60,
            fontSize: 56,
            fontColor: '#FF69B4',
            fontFamily: 'Arial',
            startTime: 15,
            endTime: 22
          }
        }
      ];

      await Template.insertMany(defaultTemplates);
      console.log('Default templates initialized');
    } catch (error) {
      console.error('Error initializing default templates:', error);
    }
  }
}

module.exports = new TemplateService();
