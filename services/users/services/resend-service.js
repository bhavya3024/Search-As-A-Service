const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (fromEmail, fromName, toEmail, toName, subject, htmlPart) => {
  try {
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: `${toName} <${toEmail}>`,
      subject: subject,
      html: htmlPart
    });
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

module.exports = sendEmail;