import { Request, Response } from "express";
import Core from "../Core";
import { acuityConfiguration } from "./booking.config";

class Booking extends Core {
  constructor() {
    super();
  }

  private getBookingAuthorizationHeader = () => {
    const encodedCredentials = btoa(
      `${acuityConfiguration.user}:${acuityConfiguration.password}`
    );

    return {
      Authorization: `Basic ${encodedCredentials}`,
    };
  };

  getAllCalendars = async () => {
    try {
      const header = this.getBookingAuthorizationHeader();

      const response = await this.get(
        `${acuityConfiguration.endpoint}/calendars`,
        header
      );

      return response;
    } catch (error) {
      this.logError(error);
    }
  };

  getAvailability = async (request: Request, res: Response) => {
    try {
      const appointmentTypeID = this.getQueryParams(
        request,
        "appointmentTypeID",
        false
      );

      const resolvedAppointmentTypeID =
        appointmentTypeID ?? acuityConfiguration.defaultAppointmentTypeID;

      const datetime = this.getQueryParams(request, "datetime");

      const header = this.getBookingAuthorizationHeader();

      const response = await this.get(
        `${acuityConfiguration.endpoint}/availability/times?date=${datetime}&appointmentTypeID=${resolvedAppointmentTypeID}`,
        header
      );

      res.status(200).send({
        isSucess: true,
        datetime,
        appointmentTypeID: resolvedAppointmentTypeID,
        data: response,
      });
    } catch (error) {
      this.logError(error);

      res.status(500).send({
        isSucess: false,
        appointmentTypeID: undefined,
        error: error.message,
      });
    }
  };
}

export default Booking;
