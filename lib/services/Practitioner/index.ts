import Core from "../Core";
import { Request, Response } from "express";
import type { PractitionerFormDataType } from "./interface";
import Database from "../Database";

class PractitionerService extends Core {
  constructor() {
    super();
  }

  public async handle(req: Request, res: Response) {
    try {
      const formData: PractitionerFormDataType = req.body;

      this.formValidator(formData);

      const adaptedFormData = this.formAdapter(formData);

      await this.saveToDatabase(adaptedFormData);

      return res.status(200).send({
        success: true,
        message: "Votre demande a bien été prise en compte",
      });
    } catch (e) {
      return res.status(200).send({
        success: false,
        message: e,
      });
    }
  }

  private formValidator(f: PractitionerFormDataType) {
    const validEmailRegex = new RegExp(
      // eslint-disable-next-line no-useless-escape
      "^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$"
    );

    const validPhoneRegex = new RegExp(
      // eslint-disable-next-line no-useless-escape
      "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$"
    );

    if (f.lastName.length < 3 || f.lastName.length > 20) {
      throw "Votre nom doit contenir entre 3 et 20 caractères";
    }
    if (f.firstName.length < 3 || f.firstName.length > 20) {
      throw "Votre prénom doit contenir entre 3 et 20 caractères";
    }
    if (!validEmailRegex.test(f.email)) {
      throw "Votre email n'est pas valide";
    }
    if (!validPhoneRegex.test(f.phoneNumber)) {
      throw "Votre numéro de téléphone n'est pas valide";
    }
    if (f.address.length < 3 || f.address.length > 50) {
      throw "Votre adresse doit contenir entre 3 et 50 caractères";
    }
  }

  private formAdapter(f: PractitionerFormDataType): PractitionerFormDataType {
    return {
      ...f,
      firstName:
        f.firstName.trim().charAt(0).toUpperCase() +
        f.firstName.trim().slice(1),
      lastName: f.lastName.trim().toUpperCase(),
      email: f.email.trim(),
      phoneNumber: f.phoneNumber.trim(),
      address: f.address.trim(),
    };
  }

  private saveToDatabase = async (f: PractitionerFormDataType) => {
    try {
      const databaseService = new Database();

      await databaseService.query(
        `INSERT INTO practitioners (first_name, last_name, email, phone_number, address) VALUES ('${f.firstName}', '${f.lastName}', '${f.email}', '${f.phoneNumber}', '${f.address}')`
      );
    } catch (e) {
      this.logError(e);

      throw "Une erreur est survenue lors de l'enregistrement de votre demande";
    }
  };
}

export default PractitionerService;
