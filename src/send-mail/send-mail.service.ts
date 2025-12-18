import { EmailDTO } from '@/dto/email.dto';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

function emailTemplate(title: string, content: string) {
  return `
    <div style="width: 70%; margin: 0 auto; font-family: Arial, sans-serif;">
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="
          background-color: #242329;
          height: 100px;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        "
      >
        <tr>
          <td
            align="center"
            valign="middle"
            style="text-align: center; vertical-align: middle;"
          >
            <h1
              style="
                color: white;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                line-height: 1.4;
              "
            >
              ${title}
            </h1>
          </td>
        </tr>
      </table>

      <!-- Body -->
      <div
        style="
          background-color: #f3f4f6;
          padding: 30px 40px;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        "
      >
        ${content}
      </div>
    </div>
  `;

  /// <a href="https://xyz.com/en/verify/{Token1}/{userID}">Click me</a>
  /// <a href="https://xyz.com/en/verify?token=TOKEN1&userId=User1">Click me</a>
}
@Injectable()
export class SendMailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendContactForm(data: EmailDTO) {
    const { firstname, lastname, email, phoneNumber, subject, message } = data;
    
    // Email to support team
    const supportContent = `
      <p><strong>From:</strong> ${firstname} ${lastname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    const supportEmailHtml = emailTemplate("New Contact Message", supportContent);
  
    await this.transporter.sendMail({
      from: email,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
      subject,
      html: supportEmailHtml,
    });

    // Confirmation email to the user
    const userContent = `
      <p>Hi ${firstname} ${lastname},</p>
      <p>We received your message and will get back to you soon.</p>
      <p>Best regards,<br />My App Team</p>
    `;

    const userEmailHtml = emailTemplate("Confirmation Email", userContent);
    
    await this.transporter.sendMail({
      from: `<${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank you for contacting us!',
      html: userEmailHtml,
    });

    return 'Email sent successfully';
  }

  async sendVerificationEmail(userEmail: string, verifyLink: string) {
    const title = "Verify Your Email";

    const content = `
      <p>Hello,</p>
      <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin-top: 20px;">
        <a 
          href="${verifyLink}" 
          style="
            background-color: #242329;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
          "
        >
          Verify Email
        </a>
      </div>

      <p style="margin-top: 20px;">Or copy/paste this link into your browser:</p>
      <p style="word-break: break-all;">${verifyLink}</p>

      <p style="margin-top: 20px;">This link will expire in 24 hours.</p>
      <p>Best regards,<br />My App Team</p>
    `;

    const html = emailTemplate(title, content);

    await this.transporter.sendMail({
      from: `My App <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Verify Your Email",
      html,
    });

    return "Verification email sent";
  }

  async sendForgetPasswordEmail(userEmail: string, verifyLink: string) {
    const title = "Forget Password";

    const content = `
      <p>Hello,</p>
      <p>Thank you ! Please verify reset your password by clicking the button below:</p>
      
      <div style="text-align: center; margin-top: 20px;">
        <a 
          href="${verifyLink}" 
          style="
            background-color: #242329;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>
      </div>

      <p style="margin-top: 20px;">Or copy/paste this link into your browser:</p>
      <p style="word-break: break-all;">${verifyLink}</p>

      <p style="margin-top: 20px;">This link will expire in 24 hours.</p>
      <p>Best regards,<br />My App Team</p>
    `;

    const html = emailTemplate(title, content);

    await this.transporter.sendMail({
      from: `My App <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Reset Password",
      html,
    });

    return "email sent";
  }
}
