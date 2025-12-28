const Order = require('../models/Order');
const emailService = require('../services/emailService');

const sendMail = async (req, res) => {
    try {

        const { orderId } = req.body;

        if (!orderId) {
            res.status(400).json({
                message: "Order ID is required"
            })
        }

        const order = await Order.findById(orderId);

        if (!order) {
            res.status(404).json({
                message: "Order not found"
            })
        }

        await emailService.sendVideoReadyEmail({
            recipientEmail: order.parentEmail,
            childName: order.childName,
            videoUrl: order.videoUrl,
            videoId: order.videoId,
            template: order.template,
            selectedScripts: order.selectedScripts
        });
        res.json({
            message: "Email sent successfully"
        })
    } catch (emailError) {
        res.status(500).json({
            message: "Email sending failed"
        })
    }
}

module.exports = { sendMail }
