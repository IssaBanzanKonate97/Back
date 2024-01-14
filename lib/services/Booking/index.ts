import { Request, Response } from "express";
import Core from "../Core";
import { acuityConfiguration } from "./booking.config";
import { AcuityAppointmentDate, AcuityAppointmentTime, AcuityAppointmentType, AcuityCalendar } from "./interfaces";
import Mail from "../Mail/mail.service";
import axios, { AxiosError } from "axios";

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

  private getAllCalendars = async (): Promise<AcuityCalendar[]> => {
    try {
      const header = this.getBookingAuthorizationHeader();

      const response = await this.get<AcuityCalendar[]>(
        `${acuityConfiguration.endpoint}/calendars`,
        header
      );

      return response;
    } catch (error) {
      this.logError(error);
    }
  };

  /*private*/ public getAllAppointmentTypes = async (): Promise<AcuityAppointmentType[]> => {
    try {
      const header = this.getBookingAuthorizationHeader();

      const response = await this.get<AcuityAppointmentType[]>(
        `${acuityConfiguration.endpoint}/appointment-types`,
        header
      );

      return response;
    } catch (error) {
      this.logError(error);
    }
  };

  /*public getAvailability = async (request: Request, res: Response) => {
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
        isSuccess: false,
        appointmentTypeID: undefined,
        error: error.message,
      });
    }
  };*/


  // ...

public createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, date, time, appointmentTypeID } = req.body;

    // Vous devez convertir la date et l'heure en un format ISO ou en un timestamp que Acuity comprend
    const dateTime = new Date(`${date}T${time}`).toISOString();

    const postData = {
      firstName,
      lastName,
      email,
      // D'autres champs nécessaires pour Acuity
      datetime: dateTime,
      appointmentTypeID,
    };

    const header = this.getBookingAuthorizationHeader();

    const response = await axios.post(
      `${acuityConfiguration.endpoint}/appointments`,
      postData,
      { headers: header }
    );

    res.status(200).json;
    (response.data);
} catch (error) {
if (axios.isAxiosError(error)) {
const axiosError = error as AxiosError;
if (axiosError.response) {
res.status(axiosError.response.status).json(axiosError.response.data);
} else {
res.status(500).json({ message: "An error occurred while connecting to Acuity." });
}
} else {
res.status(500).json({ message: error.message });
}
}
};


  public fetchAppointmentDates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { appointmentTypeID, month, calendarID } = req.query;
      
      const header = this.getBookingAuthorizationHeader();
  
      const response = await this.get<AcuityAppointmentDate[]>(
        `${acuityConfiguration.endpoint}/availability/dates?appointmentTypeID=${Number(appointmentTypeID)}&month=${String(month)}&calendarID=${Number(calendarID)}&timezone=Europe/Paris`,
        header
      );
  
      res.json(response);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          res.status(400).json(axiosError.response.data);
        }
      } else {
        res.status(400).json({message:error.message});
      }
    }
  };

  public fetchAppointmentTimes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { appointmentTypeID, calendarID, date } = req.query;
      
      const header = this.getBookingAuthorizationHeader();
  
      const response = await this.get<AcuityAppointmentTime[]>(
        `${acuityConfiguration.endpoint}/availability/times?appointmentTypeID=${Number(appointmentTypeID)}&date=${String(date)}&calendarID=${Number(calendarID)}&timezone=Europe/Paris`,
        header
      );
  
      res.json(response);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          res.status(400).json(axiosError.response.data);
        }
      } else {
        res.status(400).json({message:error.message});
      }
    }
  };

  public getCalendarsIdsFromAppointmentTypeId = async (request: Request, res: Response) => {
    try {
      const appointmentTypeID = this.getQueryParams(
        request,
        "appointmentTypeID",
        false
      );

      const resolvedAppointmentTypeID = Number(
        appointmentTypeID ?? acuityConfiguration.defaultAppointmentTypeID
      );

      const appointmentTypes = await this.getAllAppointmentTypes();

      const appointmentTypeFound = this.getAppointmentTypeFromId(
        resolvedAppointmentTypeID,
        appointmentTypes
      );

      if (!appointmentTypeFound) {
        throw new Error(
          `No appointment type found for id : ${appointmentTypeID}`
        );
      }

      const { calendarIDs } = appointmentTypeFound;

      const calendars = await this.getAllCalendars();

      const calendarsFound = this.getCalendarFromIds(calendarIDs, calendars);

      if (calendarsFound.length === 0) {
        throw new Error(
          `No calendars found for the appointment type : ${resolvedAppointmentTypeID}`
        );
      }

      return res.status(200).send({
        isSuccess: true,
        calendars: calendarsFound,
      });
    } catch (error: unknown) {
      return res.status(500).send({
        isSucess: false,
        calendars: [],
        error,
      });
    }
  };

  private getAppointmentTypeFromId = (
    appointmentTypeIdToFind: number,
    appointmentTypes: AcuityAppointmentType[]
  ): AcuityAppointmentType | undefined => {
    return appointmentTypes.find(
      (appointmentType) => appointmentType.id === appointmentTypeIdToFind
    );
  };

  private getCalendarFromIds = (calendarsIdsToFinds: number[], calendars: AcuityCalendar[]): AcuityCalendar[] | undefined => {
    return calendars.filter((calendar) =>
      calendarsIdsToFinds.includes(calendar.id)
    );
  };
}



export default Booking;
