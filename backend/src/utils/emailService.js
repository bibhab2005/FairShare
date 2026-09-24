import nodemailer from 'nodemailer';

let transporter;

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
            html: `<h3>Welcome to ${groupName}!</h3><p><b>${inviterName}</b> has added you to their expense group on FairShare.</p>`
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
            html: `<h3>New Expense Alert</h3><p><b>${payerName}</b> just added an expense of <b>₹${amount}</b> for "<i>${expenseDescription}</i>" in <b>${groupName}</b>.</p>`
        });
        
        console.log(`📨 Email sent to group members [New expense: ${expenseDescription}]`);
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log("👀 Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending expense added email:', error);
    }
};
