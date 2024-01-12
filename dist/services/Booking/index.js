"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = __importDefault(require("../Core"));
const booking_config_1 = require("./booking.config");
const axios_1 = __importDefault(require("axios"));
class Booking extends Core_1.default {
    constructor() {
        super();
    }
    getBookingAuthorizationHeader = () => {
        const encodedCredentials = btoa(`${booking_config_1.acuityConfiguration.user}:${booking_config_1.acuityConfiguration.password}`);
        return {
            Authorization: `Basic ${encodedCredentials}`,
        };
    };
    getAllCalendars = async () => {
        try {
            const header = this.getBookingAuthorizationHeader();
            const response = await this.get(`${booking_config_1.acuityConfiguration.endpoint}/calendars`, header);
            return response;
        }
        catch (error) {
            this.logError(error);
        }
    };
    /*private*/ getAllAppointmentTypes = async () => {
        try {
            const header = this.getBookingAuthorizationHeader();
            const response = await this.get(`${booking_config_1.acuityConfiguration.endpoint}/appointment-types`, header);
            return response;
        }
        catch (error) {
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
    fetchAppointmentDates = async (req, res) => {
        try {
            const { appointmentTypeID, month, calendarID } = req.query;
            const header = this.getBookingAuthorizationHeader();
            const response = await this.get(`${booking_config_1.acuityConfiguration.endpoint}/availability/dates?appointmentTypeID=${Number(appointmentTypeID)}&month=${String(month)}&calendarID=${Number(calendarID)}&timezone=Europe/Paris`, header);
            res.json(response);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                if (axiosError.response) {
                    res.status(400).json(axiosError.response.data);
                }
            }
            else {
                res.status(400).json({ message: error.message });
            }
        }
    };
    fetchAppointmentTimes = async (req, res) => {
        try {
            const { appointmentTypeID, calendarID, date } = req.query;
            const header = this.getBookingAuthorizationHeader();
            const response = await this.get(`${booking_config_1.acuityConfiguration.endpoint}/availability/times?appointmentTypeID=${Number(appointmentTypeID)}&date=${String(date)}&calendarID=${Number(calendarID)}&timezone=Europe/Paris`, header);
            res.json(response);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                if (axiosError.response) {
                    res.status(400).json(axiosError.response.data);
                }
            }
            else {
                res.status(400).json({ message: error.message });
            }
        }
    };
    getCalendarsIdsFromAppointmentTypeId = async (request, res) => {
        try {
            const appointmentTypeID = this.getQueryParams(request, "appointmentTypeID", false);
            const resolvedAppointmentTypeID = Number(appointmentTypeID ?? booking_config_1.acuityConfiguration.defaultAppointmentTypeID);
            const appointmentTypes = await this.getAllAppointmentTypes();
            const appointmentTypeFound = this.getAppointmentTypeFromId(resolvedAppointmentTypeID, appointmentTypes);
            if (!appointmentTypeFound) {
                throw new Error(`No appointment type found for id : ${appointmentTypeID}`);
            }
            const { calendarIDs } = appointmentTypeFound;
            const calendars = await this.getAllCalendars();
            const calendarsFound = this.getCalendarFromIds(calendarIDs, calendars);
            if (calendarsFound.length === 0) {
                throw new Error(`No calendars found for the appointment type : ${resolvedAppointmentTypeID}`);
            }
            return res.status(200).send({
                isSuccess: true,
                calendars: calendarsFound,
            });
        }
        catch (error) {
            return res.status(500).send({
                isSucess: false,
                calendars: [],
                error,
            });
        }
    };
    getAppointmentTypeFromId = (appointmentTypeIdToFind, appointmentTypes) => {
        return appointmentTypes.find((appointmentType) => appointmentType.id === appointmentTypeIdToFind);
    };
    getCalendarFromIds = (calendarsIdsToFinds, calendars) => {
        return calendars.filter((calendar) => calendarsIdsToFinds.includes(calendar.id));
    };
}
exports.default = Booking;
