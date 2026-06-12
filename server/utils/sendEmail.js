const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    console.log("EMAIL FUNCTION STARTED");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("TRYING SMTP VERIFY");

    const verify = await transporter.verify();

    console.log("SMTP CONNECTED", verify);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    });

    console.log("EMAIL SENT");
    console.log(info);

  } catch (error) {
    console.log("EMAIL ERROR");
    console.log(error);
  }
};

module.exports = sendEmail;