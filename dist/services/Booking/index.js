"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = __importDefault(require("../Core"));
const booking_config_1 = require("./booking.config");
const axios_1 = __importDefault(require("axios"));
const Database_1 = __importDefault(require("../Database"));
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
    createClient = async (req, res) => {
        try {
            const { firstName, lastName, email, phone } = req.body;
            const postData = {
                firstName,
                lastName,
                email,
                phone,
            };
            const header = this.getBookingAuthorizationHeader();
            const response = await axios_1.default.post(`${booking_config_1.acuityConfiguration.endpoint}/clients`, postData, { headers: header });
            res.status(200).json(response.data);
        }
        catch (error) {
        }
    };
    createAppointment = async (req, res) => {
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
            const apiResponse = await axios_1.default.post(`${booking_config_1.acuityConfiguration.endpoint}/appointments`, postData, { headers: header });
            console.log("apiResponse :");
            console.log(apiResponse);
            const acuityUserId = apiResponse.data.id;
            console.log(acuityUserId);
            const db = new Database_1.default();
            await db.createUser(acuityUserId, firstName, lastName, email, phone, password);
            await db.createAppointement(acuityUserId, appointmentTypeID, calendar, date, time);
            res.status(200).json({ message: 'Appointment and user created successfully', appointmentData: apiResponse.data });
        }
        catch (error) {
            console.error('Error creating appointment:', error);
            if (!res.headersSent) {
                if (axios_1.default.isAxiosError(error)) {
                    res.status(error.response?.status || 500).json(error.response?.data || { message: "An error occurred while connecting to the external API." });
                }
                else {
                    res.status(500).json({ message: error.message });
                }
            }
        }
    };
    rescheduleAppointment = async (req, res) => {
        const { id, newDate, newTime } = req.body;
        if (!id || !newDate || !newTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        try {
            const dateTime = new Date(`${newDate}T${newTime}`).toISOString();
            const url = `${booking_config_1.acuityConfiguration.endpoint}/appointments/${id}/reschedule`;
            const postData = {
                datetime: dateTime
            };
            const header = this.getBookingAuthorizationHeader();
            const response = await axios_1.default.put(url, postData, { headers: header });
            const acuityUserId = response.data.user.id;
            console.log(acuityUserId);
            const db = new Database_1.default();
            await db.updateAppointment(newDate, newTime, acuityUserId);
            res.status(200).json({ message: 'Appointment rescheduled successfully' });
        }
        catch (error) {
            this.logError(error);
            if (axios_1.default.isAxiosError(error) && error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    };
    loginUser = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        try {
            const db = new Database_1.default();
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
        }
        catch (error) {
            console.error('Error during the login process:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
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
