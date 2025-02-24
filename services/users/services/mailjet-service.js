const mailjet = require('node-mailjet')
  .connect(process.env.MAILJET_API_KEY, process.env.MAILJEY_SECRET_KEY);

exports.sendEmail = async (fromEmail, fromName, toEmail, toName, subject, textPart, htmlPart) => {
  try {
    await mailjet
      .post("send", { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: fromEmail,
              Name: fromName
            },
            To: [
              {
                Email: toEmail,
                Name: toName
              }
            ],
            Subject: subject,
            TextPart: textPart,
            HTMLPart: htmlPart,
            CustomCampaign: "SendAPI_campaign",
            DeduplicateCampaign: true
          }
        ]
      });
  } catch (err) {
    console.log(err.statusCode);
  }
}


