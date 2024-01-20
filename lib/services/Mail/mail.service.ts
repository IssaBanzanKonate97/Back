import Core from "../Core";
import type {
  DynamicTemplateMail,
  DynamicTemplateRecipient,
  MailTemplatesIds,
  NewPractitionerMailData,
} from "./mail.interfaces";
import mailServiceConfig from "./mail.config";
import templatesIds from "./mail.templates";

class Mail extends Core {
  sendgridEndpoint: string;
  sendgridApiKey: string;
  sendgridFrom: string;
  sendgridDisplayNameFrom: string;
  templatesIds: MailTemplatesIds;
  constructor() {
    super();
    this.sendgridEndpoint = mailServiceConfig.endpoint;
    this.sendgridApiKey = mailServiceConfig.apiKey;
    this.sendgridFrom = mailServiceConfig.from;
    this.sendgridDisplayNameFrom = mailServiceConfig.displayNameFrom;
    this.templatesIds = templatesIds;
  }

  public sendNewPractitionerMail = async (
    to: string[],
    data: NewPractitionerMailData
  ): Promise<void> => {
    try {
      const subject = "New subscription on the platform";
      const templateId = this.templatesIds.newPractitioner;

      console.log("templateId", templateId);
      console.log("data", data);

      const config: DynamicTemplateMail = {
        to,
        subject,
        templateId,
        data: {
          ...data,
        },
      };

      await this.sendDynamicTemplate(config);
    } catch (error) {
      this.logError(error);
    }
  };

  private sendDynamicTemplate = async (
    config: DynamicTemplateMail
  ): Promise<void> => {
    const payload = this.buildDynamicTemplatePayload(config);

    console.log("payload", payload);

    const headers = {
      Authorization: `Bearer ${this.sendgridApiKey}`,
      "Content-Type": "application/json",
    };

    await this.network("POST", this.sendgridEndpoint, headers, payload);

    this.logSuccess("A transactional email has been sent successfully !");
  };

  private buildDynamicTemplatePayload = (config: DynamicTemplateMail): any => {
    const { to, templateId, data, subject } = config;

    const formattedTo = this.formatEmailsToDynamicTemplateEmails(to);

    const payload: any = {
      subject: subject,
      from: {
        email: this.sendgridFrom,
        name: this.sendgridDisplayNameFrom,
      },
      personalizations: [
        {
          to: formattedTo,
          dynamic_template_data: data,
        },
      ],
      template_id: templateId,
    };

    return payload;
  };

  private formatEmailsToDynamicTemplateEmails = (
    emails: string[]
  ): DynamicTemplateRecipient[] => {
    return emails.map((email: string) => ({ email }));
  };
}

export default Mail;
