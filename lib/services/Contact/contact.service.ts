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
    // Email de confirmation pour l'expéditeur
    const mailOptionsSender = {
      from: 'support@institutadios.com',
      to: contactForm.email,
      subject: 'Confirmation de réception - Book free sessions with practitioners',
      text: `Bonjour ${contactForm.name},\n\nNous avons bien reçu votre message et vous remercions de nous avoir contactés. Un membre de notre équipe va traiter votre demande et vous répondre dans les plus brefs délais.\n\nCordialement,\nL'équipe Book free sessions with practitioners`,
  };

  // Envoyer l'email au support
  await this.transporter.sendMail(mailOptions);

  // Envoyer l'email de confirmation à l'expéditeur
  await this.transporter.sendMail(mailOptionsSender);
}

}
