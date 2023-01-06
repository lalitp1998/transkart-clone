const Aws = require("aws-sdk");
require("dotenv").config();

const awsConfig = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.region,
};

const SES = new Aws.SES(awsConfig);

const sendEmail = async (to, buffer) => {
  let email = process.env.emailSource;
  let ses_mail = "From: 'Transkart' <" + email + ">\n";
  ses_mail += "To: " + to + "\n";
  ses_mail += "Subject: Invoice\n";
  ses_mail += "MIME-Version: 1.0\n";
  ses_mail += 'Content-Type: multipart/mixed; boundary="NextPart"\n\n';
  ses_mail += "--NextPart\n";
  ses_mail += "Content-Type: text/html\n\n";
  ses_mail += "Please find your invoice attached here.\n\n";
  ses_mail += "--NextPart\n";
  ses_mail += 'Content-Type: application/octet-stream; name="invoice.pdf"\n';
  ses_mail += "Content-Transfer-Encoding: base64\n";
  ses_mail += "Content-Disposition: attachment\n\n";
  ses_mail +=
    buffer.toString("base64").replace(/([^\0]{76})/g, "$1\n") + "\n\n";
  ses_mail += "--NextPart--";

  try {
    const params = {
      RawMessage: {
        Data: ses_mail,
      },
      Source: email,
      Destinations: [to],
    };
    const emailSent = SES.sendRawEmail(params).promise();

    emailSent
      .then((data) => {
        console.log("Email sent successfully", data);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = sendEmail;
