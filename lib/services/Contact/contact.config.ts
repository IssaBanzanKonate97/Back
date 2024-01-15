import { TransportOptions } from 'nodemailer';

export const smtpConfig: TransportOptions = {
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, 
  auth: {
    user: 'support@institutadios.com',
    pass: 'm2ZsyvB3YFTER48k', 
  },
};
