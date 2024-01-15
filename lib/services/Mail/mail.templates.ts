import type { MailTemplatesIds } from "./mail.interfaces";

const newPractitioner: string = process.env.SG_TEMPLATE_NEW_PRACTITIONER || "";

const templatesIds: MailTemplatesIds = {
  newPractitioner,
};

export default templatesIds;
