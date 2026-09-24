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
<body style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); overflow: hidden; max-width: 600px; margin: 0 auto; width: 100%; max-width: 600px;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 0.5px;">FairShare</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 50px 40px; color: #374151; font-size: 18px; line-height: 1.7;">
                            ${bodyContent}
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                                You are receiving this email because you are a part of a FairShare group.
                            </p>
                            <p style="margin: 10px 0 0 0; font-size: 14px; color: #9ca3af;">
                                © ${new Date().getFullYear()} FairShare. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
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
            from: `FairShare <${process.env.SMTP_USER || 'noreply@fairshare.com'}>`,
            to: userEmail,
            subject: `You've been added to ${groupName}`,
            text: `Hello, ${inviterName} has added you to the group "${groupName}" on FairShare.`,
            html: getEmailTemplate('Welcome to the Group!', `
                <h2 style="color: #111827; margin-top: 0; font-size: 26px; font-weight: 700;">Welcome to ${groupName}!</h2>
                <p style="margin-bottom: 20px;"><b>${inviterName}</b> has added you to their expense group on FairShare.</p>
                <p>You can now start tracking shared expenses, viewing balances, and settling up seamlessly with your friends.</p>
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
            from: `FairShare <${process.env.SMTP_USER || 'noreply@fairshare.com'}>`,
            bcc: groupMembersEmails.join(','), // bcc so emails remain private
            subject: `New expense in ${groupName}: ${expenseDescription}`,
            text: `${payerName} added a new expense: "${expenseDescription}" for ₹${amount}.`,
            html: getEmailTemplate('New Expense Added', `
                <h2 style="color: #111827; margin-top: 0; font-size: 26px; font-weight: 700;">New Expense in ${groupName}</h2>
                <p style="margin-bottom: 25px;"><b>${payerName}</b> just added a new expense.</p>
                <div style="background-color: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; font-size: 15px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Description</p>
                    <p style="margin: 0 0 25px 0; font-size: 22px; color: #111827; font-weight: 600;">${expenseDescription}</p>
                    <p style="margin: 0 0 8px 0; font-size: 15px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Amount</p>
                    <p style="margin: 0; font-size: 32px; color: #4f46e5; font-weight: 800;">₹${amount}</p>
                </div>
                <p>Check the app to see how this affects your balances!</p>
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
            from: `FairShare <${process.env.SMTP_USER || 'noreply@fairshare.com'}>`,
            bcc: groupMembersEmails.join(','), // bcc so emails remain private
            subject: `Group Deleted: ${groupName}`,
            text: `Hello, ${deleterName} has deleted the group "${groupName}". If this was against your knowledge, please contact them immediately.`,
            html: getEmailTemplate('Group Deleted', `
                <h2 style="color: #111827; margin-top: 0; font-size: 26px; font-weight: 700;">Group Deleted</h2>
                <p><b>${deleterName}</b> has deleted the group <b>${groupName}</b>.</p>
                <p>All expenses and balances associated with this group have been permanently removed.</p>
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 12px; margin-top: 30px;">
                    <p style="color: #dc2626; font-size: 16px; margin: 0; font-weight: 500;">
                        If this was done by mistake or without your knowledge, please contact them immediately.
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
            from: `FairShare <${process.env.SMTP_USER || 'noreply@fairshare.com'}>`,
            to: creatorEmail,
            subject: `New member joined: ${groupName}`,
            text: `Great news! ${newMemberName} has joined your group "${groupName}" on FairShare.`,
            html: getEmailTemplate('New Member Alert!', `
                <h2 style="color: #111827; margin-top: 0; font-size: 26px; font-weight: 700;">Great News!</h2>
                <p><b>${newMemberName}</b> has just used your invite link to join your expense group <b>${groupName}</b>.</p>
                <p>They can now start adding expenses and viewing the group balances.</p>
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
            from: `FairShare <${process.env.SMTP_USER || 'noreply@fairshare.com'}>`,
            to: receiverEmail,
            subject: `Payment received in ${groupName}`,
            text: `Hello ${receiverName}, ${payerName} has recorded a payment of ₹${amount} to you in "${groupName}".`,
            html: getEmailTemplate('Payment Received', `
                <h2 style="color: #111827; margin-top: 0; font-size: 26px; font-weight: 700;">Payment Received!</h2>
                <p>Hello <b>${receiverName}</b>,</p>
                <p><b>${payerName}</b> has recorded a settlement payment to you in <b>${groupName}</b>.</p>
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 15px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Amount Settled</p>
                    <p style="margin: 0; font-size: 38px; color: #15803d; font-weight: 800;">₹${amount}</p>
                </div>
                <p>Check your balances in the app to confirm everything is up to date.</p>
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
