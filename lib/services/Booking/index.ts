import { Request, Response } from "express";
import Core from "../Core";
import { acuityConfiguration } from "./booking.config";
import { AcuityAppointmentDate, AcuityAppointmentTime, AcuityAppointmentType, AcuityCalendar } from "./interfaces";
import Mail from "../Mail/mail.service";
import axios, { AxiosError } from "axios";
import Database from "../Database";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



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


  public createClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { firstName, lastName, email, phone } = req.body;

      const postData = {
        firstName,
        lastName,
        email,
        phone,
      };

      const header = this.getBookingAuthorizationHeader();

      const response = await axios.post(
        `${acuityConfiguration.endpoint}/clients`,
        postData,
        { headers: header }
      );

      res.status(200).json(response.data);
    } catch (error) {

    }
  };


  public createAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { firstName, lastName, email, date, time, appointmentTypeID, calendar, phone, password } = req.body;


      if (!firstName || !lastName || !email || !date || !time || !appointmentTypeID || !calendar || !phone || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }


      const dateTime = new Date(`${date}T${time}`).toISOString();


      const postData = {
        firstName,
        lastName,
        email,
        phone,
        datetime: dateTime,
        appointmentTypeID,
        calendar,
        password,
      };

      const header = this.getBookingAuthorizationHeader();


      const apiResponse = await axios.post(
        `${acuityConfiguration.endpoint}/appointments`,
        postData,
        { headers: header }
      );

      console.log("apiResponse :");
      console.log(apiResponse);
      const acuityUserId = apiResponse.data.id;
      console.log(acuityUserId);



      const db = new Database();
      await db.createUser(acuityUserId, firstName, lastName, email, phone, password);
      await db.createAppointement(acuityUserId, appointmentTypeID, calendar, date, time);




      res.status(200).json({ message: 'Appointment and user created successfully', appointmentData: apiResponse.data });

    } catch (error) {
      console.error('Error creating appointment:', error);


      if (!res.headersSent) {
        if (axios.isAxiosError(error)) {
          res.status(error.response?.status || 500).json(error.response?.data || { message: "An error occurred while connecting to the external API." });
        } else {
          res.status(500).json({ message: error.message });
        }
      }

    }
  };

  public rescheduleAppointment = async (req: Request, res: Response): Promise<void> => {
    const { id, newDate, newTime } = req.body;

    if (!id || !newDate || !newTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const dateTime = new Date(`${newDate}T${newTime}`).toISOString();

      const url = `${acuityConfiguration.endpoint}/appointments/${id}/reschedule`;

      const postData = {
        datetime: dateTime
      };

      const header = this.getBookingAuthorizationHeader();


      await axios.put(url, postData, { headers: header });


      const db = new Database();
      await db.updateAppointment(id, newDate, newTime);

      res.status(200).json({ message: 'Appointment rescheduled successfully' });
    } catch (error) {
      this.logError(error);
      if (axios.isAxiosError(error) && error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };



  public loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      const db = new Database();
      const user = await db.findUserByEmail(email);
      const user_id = user.user_id;
      console.log("user_id: ", user_id);
      if (!user) {
        return res.status(401).json({ message: 'Invalid login credentials.' });
      }

      const isMatch = (user.password_hash === password);


      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid login credentials.' });
      }

      // Si les mots de passe correspondent, procédez avec la connexion.
      res.status(200).json({ message: 'Authentication successful', acuityUserId: user_id });
    } catch (error) {
      console.error('Error during the login process:', error);
      res.status(500).json({ message: 'Internal server error' });
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
        res.status(400).json({ message: error.message });
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
        res.status(400).json({ message: error.message });
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
