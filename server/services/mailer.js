const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    debug: true, // Enable debug output
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
    // authMethod: 'LOGIN', // Removed this as it can cause issues with Gmail
});

const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        console.log("Mailer Config - User:", process.env.GMAIL_USER ? "Set" : "Missing");

        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            throw new Error("Missing email credentials - falling back to local save");
        }

        const info = await transporter.sendMail({
            from: `"Pagoda Feedback System" <${process.env.GMAIL_USER}>`, // sender address
            to: to.join(', '), // list of receivers
            subject: subject, // Subject line
            html: html, // html body
            attachments: attachments // array of attachment objects
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email (saving locally instead):", error.message);

        // Save attachments locally for verification
        if (attachments && attachments.length > 0) {
            const reportDir = path.join(__dirname, '../reports');
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }

            attachments.forEach(att => {
                const filePath = path.join(reportDir, att.filename);
                fs.writeFileSync(filePath, att.content);
                console.log(`Saved report locally: ${filePath}`);
            });
        }
    }
};

module.exports = { sendEmail };
