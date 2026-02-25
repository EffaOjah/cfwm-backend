const { sendContactEmail } = require('../services/emailService');

const submitContactForm = async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            status: 'error',
            message: 'All fields are required.',
        });
    }

    try {
        await sendContactEmail({ name, email, subject, message });
        return res.status(200).json({
            status: 'success',
            message: 'Your message has been sent successfully!',
        });
    } catch (error) {
        console.error('Contact form email error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to send your message. Please try again later.',
        });
    }
};

module.exports = { submitContactForm };