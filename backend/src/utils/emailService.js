import nodemailer from 'nodemailer';

let transporter;

const getEmailTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #111111; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111111; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1c1c1c; border-radius: 12px; overflow: hidden; max-width: 600px; margin: 0 auto; width: 100%;">
                    <tr>
                        <td style="background-color: #4f46e5; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">FairShare</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 40px 50px 40px; color: #e5e7eb; font-size: 16px; line-height: 1.6;">
                            ${bodyContent}
                        </td>
                    </tr>
                </table>
                <p style="text-align: center; color: #6b7280; font-size: 13px; margin-top: 25px;">© ${new Date().getFullYear()} FairShare. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const initEmailService = async () => {
    try {
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            console.log('📧 Email service initialized with SMTP credentials.');
        } else {
            console.log('📧 Setting up test email account (Ethereal)...');
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
            console.log('📧 Test email service initialized. Previews will be logged.');
        }
    } catch (error) {
        console.error('Failed to initialize email service:', error);
    }
};

export const sendGroupInviteEmail = async (userEmail, groupName, inviterName) => {
    if (process.env.NODE_ENV === 'test') return;
    try {
        if (!transporter) await initEmailService();
        if (!transporter) return; // If it still fails, silently exit

        const info = await transporter.sendMail({
            from: '"FairShare" <noreply@fairshare.buzz>',
            to: userEmail,
            subject: `You've been added to ${groupName}`,
            text: `Hello, ${inviterName} has added you to the group "${groupName}" on FairShare.`,
            html: getEmailTemplate('Added to Group', `
                <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600;">Welcome to the group!</h2>
                <p style="color: #d1d5db; margin-bottom: 30px;">You have just been added to a new group on FairShare.</p>
                <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #60a5fa; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Group Name</p>
                    <p style="margin: 0; font-size: 28px; color: #bfdbfe; font-weight: 600;">${groupName}</p>
                </div>
                <p style="color: #d1d5db;">Open the app to see shared expenses and start splitting costs.</p>
            `)
        });
        
        console.log(`📨 Email sent to ${userEmail} [Added to group]`);
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log("👀 Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending group invite email:', error);
    }
};

export const sendExpenseAddedEmail = async (groupMembersEmails, groupName, expenseDescription, amount, payerName) => {
    if (process.env.NODE_ENV === 'test') return;
    try {
        if (!transporter) await initEmailService();
        if (!transporter || !groupMembersEmails || groupMembersEmails.length === 0) return;

        const info = await transporter.sendMail({
            from: '"FairShare" <noreply@fairshare.buzz>',
            bcc: groupMembersEmails.join(','), // bcc so emails remain private
            subject: `New expense in ${groupName}: ${expenseDescription}`,
            text: `A new expense "${expenseDescription}" of ₹${amount} was added in "${groupName}" by ${payerName}.`,
            html: getEmailTemplate('New Expense', `
                <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600;">New expense added</h2>
                <p style="color: #d1d5db; margin-bottom: 30px;"><b>${payerName}</b> just added a new expense in <b>${groupName}</b>.</p>
                <div style="background-color: #111827; border: 1px solid #1f2937; padding: 25px; border-radius: 12px; margin: 30px 0;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Description</p>
                    <p style="margin: 0 0 20px 0; font-size: 20px; color: #ffffff; font-weight: 500;">${expenseDescription}</p>
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Amount</p>
                    <p style="margin: 0; font-size: 32px; color: #60a5fa; font-weight: 600;">₹${amount}</p>
                </div>
                <p style="color: #d1d5db;">Check the app to see how this affects your balances.</p>
            `)
        });
        
        console.log(`📨 Email sent to group members [New expense: ${expenseDescription}]`);
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log("👀 Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending expense added email:', error);
    }
};

export const sendGroupDeletedEmail = async (groupMembersEmails, groupName, deleterName) => {
    if (process.env.NODE_ENV === 'test') return;
    try {
        if (!transporter) await initEmailService();
        if (!transporter || !groupMembersEmails || groupMembersEmails.length === 0) return;

        const info = await transporter.sendMail({
            from: '"FairShare" <noreply@fairshare.buzz>',
            bcc: groupMembersEmails.join(','), // bcc so emails remain private
            subject: `Group Deleted: ${groupName}`,
            text: `Hello, the group "${groupName}" has been deleted by ${deleterName}. This action cannot be undone.`,
            html: getEmailTemplate('Group Deleted', `
                <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600;">Group deleted</h2>
                <p style="color: #d1d5db;">Hello,</p>
                <p style="color: #d1d5db; margin-bottom: 30px;"><b>${deleterName}</b> has deleted the group <b>${groupName}</b>.</p>
                <div style="background-color: #450a0a; border: 1px solid #7f1d1d; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #ef4444; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Group Removed</p>
                    <p style="margin: 0; font-size: 28px; color: #f87171; font-weight: 600;">${groupName}</p>
                </div>
                <p style="color: #d1d5db;">All expenses, balances, and shared history for this group have been permanently removed and can no longer be accessed.</p>
                <div style="background-color: #451a03; border-left: 4px solid #d97706; padding: 15px 20px; margin-top: 30px;">
                    <p style="margin: 0; font-size: 14px; color: #fbbf24;">
                        <b>Note:</b> If you believe this was a mistake, please reach out to <b>${deleterName}</b> directly. This action cannot be undone from the app.
                    </p>
                </div>
            `)
        });
        
        console.log(`📨 Email sent to group members [Group deleted: ${groupName}]`);
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log("👀 Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending group deleted email:', error);
    }
};

export const sendMemberJoinedEmail = async (creatorEmail, groupName, newMemberName) => {
    if (process.env.NODE_ENV === 'test') return;
    try {
        if (!transporter) await initEmailService();
        if (!transporter || !creatorEmail) return;

        const info = await transporter.sendMail({
            from: '"FairShare" <noreply@fairshare.buzz>',
            to: creatorEmail,
            subject: `New member joined: ${groupName}`,
            text: `${newMemberName} has joined your group "${groupName}".`,
            html: getEmailTemplate('New Member Joined', `
                <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600;">New member joined</h2>
                <p style="color: #d1d5db; margin-bottom: 30px;">Good news, your group just grew.</p>
                <div style="background-color: #052e16; border: 1px solid #14532d; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #22c55e; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Joined</p>
                    <p style="margin: 0; font-size: 28px; color: #4ade80; font-weight: 600;">${newMemberName}</p>
                </div>
                <p style="color: #d1d5db;"><b>${newMemberName}</b> has joined <b>${groupName}</b> and can now add and split expenses.</p>
            `)
        });
        
        console.log(`📨 Email sent to ${creatorEmail} [Member joined via link]`);
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log("👀 Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending member joined email:', error);
    }
};

export const sendSettlementEmail = async (receiverEmail, payerName, receiverName, amount, groupName) => {
    if (process.env.NODE_ENV === 'test') return;
    try {
        if (!transporter) await initEmailService();
        if (!transporter || !receiverEmail) return;

        const info = await transporter.sendMail({
            from: '"FairShare" <noreply@fairshare.buzz>',
            to: receiverEmail,
            subject: `Payment received in ${groupName}`,
            text: `Hello ${receiverName}, ${payerName} has recorded a payment of ₹${amount} to you in "${groupName}".`,
            html: getEmailTemplate('Payment Received', `
                <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600;">Payment received!</h2>
                <p style="color: #d1d5db;">Hello <b>${receiverName}</b>,</p>
                <p style="color: #d1d5db; margin-bottom: 30px;"><b>${payerName}</b> has recorded a settlement payment to you in <b>${groupName}</b>.</p>
                <div style="background-color: #052e16; border: 1px solid #14532d; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #22c55e; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Amount Settled</p>
                    <p style="margin: 0; font-size: 38px; color: #4ade80; font-weight: 600;">₹${amount}</p>
                </div>
                <p style="color: #d1d5db;">Check your balances in the app to confirm everything is up to date.</p>
                <div style="background-color: #451a03; border-left: 4px solid #d97706; padding: 15px 20px; margin-top: 30px;">
                    <p style="margin: 0; font-size: 14px; color: #fbbf24;">
                        <b>Disclaimer:</b> please confirm the money was actually credited before marking this settled.
                    </p>
                </div>
            `)
        });
        
        console.log(`📨 Email sent to ${receiverEmail} [Settlement received]`);
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log("👀 Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending settlement email:', error);
    }
};
