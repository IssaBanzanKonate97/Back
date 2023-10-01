"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = __importDefault(require("../Core"));
const booking_config_1 = require("./booking.config");
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
    getAvailability = async (request, res) => {
        try {
            const appointmentTypeID = this.getQueryParams(request, "appointmentTypeID", false);
            const resolvedAppointmentTypeID = appointmentTypeID ?? booking_config_1.acuityConfiguration.defaultAppointmentTypeID;
            const datetime = this.getQueryParams(request, "datetime");
            const header = this.getBookingAuthorizationHeader();
            const response = await this.get(`${booking_config_1.acuityConfiguration.endpoint}/availability/times?date=${datetime}&appointmentTypeID=${resolvedAppointmentTypeID}`, header);
            res.status(200).send({
                isSucess: true,
                datetime,
                appointmentTypeID: resolvedAppointmentTypeID,
                data: response,
            });
        }
        catch (error) {
            this.logError(error);
            res.status(500).send({
                isSucess: false,
                appointmentTypeID: undefined,
                error: error.message,
            });
        }
    };
}
exports.default = Booking;
