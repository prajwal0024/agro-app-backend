const nodemailer = require('nodemailer');
const pug = require('pug');

const sendMail = async (options) => {
  try {
    const html = pug.renderFile(`${__dirname}/../templates/passwordreset.pug`, {
      passwordResetOTP: options.passwordResetOTP,
    });

    // 1. Create Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Define Email Action
    const mailOptions = {
      from: 'AgroApp',
      to: options.email,
      subject: options.subject,
      html,
      text: options.message,
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log({ error });
  }
};

module.exports = sendMail;
