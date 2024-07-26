const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendMail = asyncHandler(async ({ email, html, subject }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // Gọi hàm main() để gửi email
  const info = await main();

  // Hàm main để gửi email
  async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Shop24H" <no-reply@E-shopper@gmail.com>', // sender address
      to: email, // list of receivers
      subject: `${subject} ✔`, // Subject line
      text: "Hello User?", // plain text body
      html: html, // html body
    });

    return info;
  }

  return info; // Trả về thông tin của email đã gửi
});

module.exports = sendMail;
