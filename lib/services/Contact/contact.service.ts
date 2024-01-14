import { ContactForm } from './contact.interface';
import * as nodemailer from 'nodemailer';
import { smtpConfig } from './contact.config';

export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  async sendMail(contactForm: ContactForm): Promise<void> {
    const mailOptions = {
      from: contactForm.email,
      to: 'support@institutadios.com',
      subject: `Demande de session gratuite - ${contactForm.name}`,
      text: `Name: ${contactForm.name}\nEmail: ${contactForm.email}\nMessage: ${contactForm.message}`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
