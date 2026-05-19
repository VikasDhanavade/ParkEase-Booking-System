import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        let transporter;

        // If you provided real SMTP credentials in your .env, use them natively!
        if (process.env.SMTP_HOST) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            // Otherwise, automatically generate a Virtual Mailbox via Ethereal to preview emails during Development!
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const senderEmail = process.env.SMTP_FROM_EMAIL || '"ParkEase" <no-reply@parkease.com>';

        const info = await transporter.sendMail({
            from: senderEmail,
            to,
            subject,
            text,
            html
        });

        console.log(`\n📧 EMAIL SUCCESSFULLY SENT to ${to}`);

        if (!process.env.SMTP_HOST) {
            console.log(`🔗 PREVIEW YOUR LIVE LOGIN EMAIL HERE: ${nodemailer.getTestMessageUrl(info)}\n`);
        }
    } catch (error) {
        console.error("❌ Failed to send email alert:", error);
    }
};
