import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // 1. Create a transporter (the "mail carrier")
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // 2. Define the email content
    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    // 3. Send it!
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
