const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.name;
    this.from = `Süleyman Akıllı <suleymanakilli@gmail.com>`;
  }

  async newTransport() {
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "suleymanakilli50@gmail.com",
        pass: "njclmyeefyowrncw"
      }
    });
    /*if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });*/
  }

  // Send the actual email
  async send(subject, text) {
    // 1) Render HTML based on a pug template
    /*const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });*/

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to, //this.to,
      subject,
      html: text,
      text
    };

    // 3) Create a transport and send email
    await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    }).sendMail(mailOptions);
    //await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome(code) {
    await this.send("Kaydınızı tamamlayın!", `Your code is: ${code}`);
  }

  async sendLoginCode(code) {
    await this.send("Giriş kodunuz", `Your code is: ${code}`);
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
