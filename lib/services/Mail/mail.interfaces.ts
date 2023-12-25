export interface DynamicTemplateMail {
  to: string[];
  subject: string;
  templateId: string;
  data: {
    [key: string]: string;
  };
}

export interface DynamicTemplateRecipient {
  email: string;
}

export interface MailServiceConfig {
  apiKey: string;
  endpoint: string;
  from: string;
  displayNameFrom: string;
}

export interface MailTemplatesIds {
  [key: string]: string;
}

export interface NewPractitionerMailData {
  lastName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  address: string;
  date: string;
}