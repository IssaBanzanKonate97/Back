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
    /*public getAllClients = async (req: Request, res: Response): Promise<void> => {
      try {
        const header = this.getBookingAuthorizationHeader();
    
        const response = await axios.get<ClientDataType[]>(
          `${acuityConfiguration.endpoint}/clients`,
          { headers: header }
        );
    
        res.status(200).json(response.data);
      } catch (error) {
        
      }
    };
    */
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
            // Validation des données (à compléter en fonction de vos besoins)
            if (!firstName || !lastName || !email || !date || !time || !appointmentTypeID || !calendar || !phone || !password) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            // Formatage de la date et de l'heure au format ISO pour l'API externe
            const dateTime = new Date(`${date}T${time}`).toISOString();
            // Préparation des données pour l'API externe
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
            // Appel à l'API externe
            const apiResponse = await axios_1.default.post(`${booking_config_1.acuityConfiguration.endpoint}/appointments`, postData, { headers: header });
            const acuityUserId = apiResponse.data.id;
            // Enregistrement dans la base de données
            const db = new Database_1.default();
            const userId = await db.createUser(firstName, lastName, email, phone, password);
            await db.createAppointement(userId, appointmentTypeID, calendar, date, time);
            // Envoi de la réponse au client après toutes les opérations
            res.status(200).json({ message: 'Appointment and user created successfully', appointmentData: apiResponse.data });
        }
        catch (error) {
            console.error('Error creating appointment:', error);
            // Check if a response has already been sent
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
    loginUser = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        try {
            const db = new Database_1.default();
            const user = await db.findUserByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid login credentials.' });
            }
            // Ici, nous comparons directement les mots de passe en clair.
            // Assurez-vous que le mot de passe dans la base de données est également en clair pour cette comparaison.
            const isMatch = (user.password_hash === password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid login credentials.' });
            }
            // Si les mots de passe correspondent, procédez avec la connexion.
            res.status(200).json({ message: 'Authentication successful', userId: user.id });
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
