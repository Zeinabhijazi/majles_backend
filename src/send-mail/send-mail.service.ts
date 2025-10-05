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
    //console.log("send")
    const { firstname, lastname, email, message } = data;
    const subject = `New Contact Form Message from ${firstname} ${lastname}`;
    const text = `
      From: ${firstname} ${lastname}
      Email: ${email}
      Message: ${message}
    `;

    const html = `
      <h3>New Contact Message</h3>
      <p><strong>From:</strong> ${firstname} ${lastname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    const info = await this.transporter.sendMail({
      from: `"My App" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER, 
      subject,
      text,
      html,
    });
    
    return " Email sent successfully";
  }
}
