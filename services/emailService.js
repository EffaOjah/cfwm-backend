const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465, // true for port 465 (SSL)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Sends a contact form submission email to the site owner.
 */
const sendContactEmail = async ({ name, email, subject, message }) => {
    const mailOptions = {
        from: `"CFWM Website" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        replyTo: email,
        subject: `New Contact Message: ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background: #cc121a; padding: 24px; text-align: center;">
                    <h2 style="color: white; margin: 0; font-size: 1.4rem;">New Contact Form Submission</h2>
                </div>
                <div style="padding: 32px; background: #ffffff;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; font-weight: bold; color: #4a5568; width: 100px;">Name:</td>
                            <td style="padding: 10px 0; color: #1a202c;">${name}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Email:</td>
                            <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #cc121a;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Subject:</td>
                            <td style="padding: 10px 0; color: #1a202c;">${subject}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 24px;">
                        <p style="font-weight: bold; color: #4a5568; margin-bottom: 8px;">Message:</p>
                        <div style="background: #f8fafc; border-left: 4px solid #cc121a; padding: 16px; border-radius: 4px; color: #1a202c; line-height: 1.6;">
                            ${message.replace(/\n/g, '<br/>')}
                        </div>
                    </div>
                    <p style="margin-top: 24px; color: #718096; font-size: 0.9rem;">
                        You can reply directly to this email to respond to ${name}.
                    </p>
                </div>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendContactEmail };