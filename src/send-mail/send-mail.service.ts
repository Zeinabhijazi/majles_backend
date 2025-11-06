import { EmailDTO } from '@/dto/email.dto';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SendMailService {
  private transporter: nodemailer.Transporter;

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
    const html = `
      <p><strong>From:</strong> ${firstname} ${lastname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    // Send email to the supports
    await this.transporter.sendMail({
      from: email,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
      subject,
      html,
    });

    // Send confirmation email to the user
    await this.transporter.sendMail({
      from: `<${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank you for contacting us!',
      html: `
        <div style="width: 70%; margin: 0 auto; font-family: Arial, sans-serif;">
          <!-- Header -->
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
                  Confirmation Email
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
            <p style="margin-top: 0;">Hi ${firstname} ${lastname},</p>
            <p>We received your message and will get back to you soon.</p>
            <p>Best regards,<br />My App Team</p>
          </div>
        </div>
      `,
    });

    return ' Email sent successfully';
  }
}
