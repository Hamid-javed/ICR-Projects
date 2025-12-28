const nodemailer = require('nodemailer');

require('dotenv').config();

class EmailService {
  constructor() {
    // Create email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }



  /**
   * Send video ready notification email
   * @param {Object} emailData - Email data object
   * @param {string} emailData.recipientEmail - User's email
   * @param {string} emailData.childName - Child's name
   * @param {string} emailData.videoUrl - Cloud storage video URL
   * @param {string} emailData.videoId - Video ID
   * @param {Object} emailData.template - Template info
   * @param {Array} emailData.selectedScripts - Selected scripts
   */
  async sendVideoReadyEmail(emailData) {
    try {
      const {
        recipientEmail,
        childName,
        videoUrl,
        videoId,
        template,
        selectedScripts
      } = emailData;

      // Generate HTML email template
      const htmlContent = this.generateVideoReadyEmailHTML({
        childName,
        videoUrl,
        videoId,
        template,
        selectedScripts
      });

      // Generate plain text version
      const textContent = this.generateVideoReadyEmailText({
        childName,
        videoUrl,
        template
      });

      const mailOptions = {
        from: {
          name: process.env.FROM_EMAIL || 'Santa\'s Workshop',
          address: process.env.SMTP_USER
        },
        to: recipientEmail,
        subject: `🎅 Your Personalized Santa Video for ${childName} is Ready!`,
        text: textContent,
        html: htmlContent,
        attachments: []
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
        recipientEmail: recipientEmail
      };

    } catch (error) {
      console.error('❌ Error sending video ready email:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email content
   */
  generateVideoReadyEmailHTML(data) {
    const { childName, videoUrl, template, selectedScripts } = data;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Santa Video is Ready!</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #2c3e50;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 15px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 3px solid #e74c3c;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .santa-emoji {
          font-size: 48px;
          margin-bottom: 10px;
        }
        h1 {
          color: #c0392b;
          font-size: 28px;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .video-section {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          margin: 30px 0;
        }
        .download-button {
          display: inline-block;
          background-color: #27ae60;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 25px;
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        .download-button:hover {
          background-color: #229954;
          transform: translateY(-2px);
        }
        .details {
          background-color: #ecf0f1;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .detail-item {
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px dotted #bdc3c7;
        }
        .detail-label {
          font-weight: bold;
          color: #2c3e50;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px dotted #e74c3c;
          color: #7f8c8d;
          font-style: italic;
        }
        .magic-text {
          color: #8e44ad;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="santa-emoji">🎅</div>
          <h1>Ho Ho Ho! ${childName}'s Video is Ready!</h1>
        </div>
        
        <div class="video-section">
          <h2>🎬 Your Magical Santa Video is Complete!</h2>
          <p>Santa has finished creating a special personalized video just for <strong>${childName}</strong>!</p>
          <a href="${videoUrl}" class="download-button">
            📥 Watch & Download Video
          </a>
        </div>
        
        <div class="details">
          <h3>🎄 Video Details:</h3>
          <div class="detail-item">
            <span class="detail-label">Child's Name:</span> ${childName}
          </div>
          <div class="detail-item">
            <span class="detail-label">Template:</span> ${template?.name || 'Santa Special'}
          </div>
          <div class="detail-item">
            <span class="detail-label">Created:</span> ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
          </div>
          ${selectedScripts && selectedScripts.length > 0 ? `
          <div class="detail-item">
            <span class="detail-label">Special Messages:</span> ${selectedScripts.length} personalized segments
          </div>
          ` : ''}
        </div>
        
        <p>🎁 This video was created with love and Christmas magic, featuring:</p>
        <ul>
          <li>✨ Personalized Santa greeting with ${childName}'s name</li>
          <li>📸 Your uploaded photos showcased beautifully</li>
          <li>🎭 Custom script segments chosen just for ${childName}</li>
          <li>🎵 Magical Christmas atmosphere</li>
        </ul>
        
        <p><strong class="magic-text">Save this email!</strong> You can download the video anytime using the link above. The video will be available for download for the next 30 days.</p>
        
        <div class="footer">
          <p>🎄 <em>Bringing Christmas magic to children around the world</em> 🎄</p>
          <p>From all of us at Santa's Workshop</p>
          <p style="font-size: 12px; margin-top: 20px;">
            If you have any issues downloading your video, please contact our support team.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate plain text email content
   */
  generateVideoReadyEmailText(data) {
    const { childName, videoUrl, template } = data;

    return `
🎅 Ho Ho Ho! ${childName}'s Santa Video is Ready!

Dear Parent,

Great news! Santa has finished creating a magical personalized video for ${childName}!

🎬 VIDEO DETAILS:
- Child's Name: ${childName}
- Template: ${template?.name || 'Santa Special'}
- Created: ${new Date().toLocaleDateString()}

📥 DOWNLOAD YOUR VIDEO:
${videoUrl}

This special video includes:
✨ Personalized Santa greeting with ${childName}'s name
📸 Your uploaded photos showcased beautifully  
🎭 Custom script segments chosen just for ${childName}
🎵 Magical Christmas atmosphere

IMPORTANT: Save this email! You can download the video anytime using the link above. The video will be available for 30 days.

If you have any issues downloading your video, please contact our support team.

🎄 Bringing Christmas magic to children around the world 🎄

With Christmas wishes,
Santa's Workshop Team
    `;
  }

  /**
   * Send order confirmation email (when order is first created)
   */
  async sendOrderConfirmationEmail(emailData) {
    try {
      const { recipientEmail, childName, orderId, template } = emailData;

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #c41e3a; color: white; padding: 20px; text-align: center; border-radius: 10px; }
          .content { padding: 30px; background-color: #f9f9f9; border-radius: 10px; margin-top: 20px; }
          .button { background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎅 Order Confirmation</h1>
          <h2>Santa is preparing ${childName}'s video!</h2>
        </div>
        <div class="content">
          <p>Thank you for your order! Santa's elves are now working on creating a magical personalized video for <strong>${childName}</strong>.</p>
          
          <h3>📋 Order Details:</h3>
          <ul>
            <li><strong>Order ID:</strong> ${orderId}</li>
            <li><strong>Child's Name:</strong> ${childName}</li>
            <li><strong>Template:</strong> ${template?.name || 'Santa Special'}</li>
            <li><strong>Status:</strong> Processing</li>
          </ul>
          
          <p>🎬 <strong>What happens next?</strong></p>
          <ol>
            <li>Our elves are processing your photos and script selections</li>
            <li>Santa will record the personalized message</li>
            <li>The video will be compiled with Christmas magic</li>
            <li>You'll receive another email with the download link</li>
          </ol>
          
          <p><em>Expected completion time: 5-10 minutes</em></p>
          
          <p>Thank you for choosing Santa's Workshop!</p>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Santa\'s Workshop',
          address: process.env.SMTP_USER
        },
        to: recipientEmail,
        subject: `🎅 Order Confirmation - ${childName}'s Santa Video is Being Prepared!`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation email sent to: ${recipientEmail}`);

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration() {
    try {
      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Email configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
