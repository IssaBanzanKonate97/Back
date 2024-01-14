"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const Booking_1 = __importDefault(require("./services/Booking"));
const Practitioner_1 = __importDefault(require("./services/Practitioner"));
const contact_service_1 = require("./services/Contact/contact.service");
const contact_config_1 = require("./services/Contact/contact.config");
const cors = require("cors");
const port = process.env.PORT || 4000;
const app = (0, express_1.default)();
app.use(cors());
app.use(express_1.default.json());
app.get("/calendars/all", async (req, res) => {
    const booking = new Booking_1.default();
    return await booking.getCalendarsIdsFromAppointmentTypeId(req, res);
});
app.get("/fetch_appointment_dates", async (req, res) => {
    const booking = new Booking_1.default();
    await booking.fetchAppointmentDates(req, res);
});
app.get("/fetch_appointment_times", async (req, res) => {
    const booking = new Booking_1.default();
    await booking.fetchAppointmentTimes(req, res);
});
app.post("/api/become-practitioner", async (req, res) => {
    const practitionerService = new Practitioner_1.default();
    await practitionerService.handle(req, res);
});
app.get("/appointment-types/all", async (req, res) => {
    const booking = new Booking_1.default();
    try {
        const appointmentTypes = await booking.getAllAppointmentTypes();
        res.json(appointmentTypes);
    }
    catch (error) {
        res.status(500).send(error.toString());
    }
});
app.post('/api/book-appointment', async (req, res) => {
    const booking = new Booking_1.default();
    await booking.createAppointment(req, res);
});
app.get('/', (req, res) => {
    const links = [];
    app._router.stack.forEach(function (app) {
        if (app.route && app.route.path && app.route.path !== '/') {
            links.push(`<a href='${app.route.path}'>${app.route.path}</a>`);
        }
    });
    return res.send(`API fonctionne<br>${links.join('<br>')}`);
});
app.post("/api/contact", async (req, res) => {
    const contactService = new contact_service_1.ContactService(contact_config_1.smtpConfig);
    try {
        await contactService.sendMail(req.body);
        res.status(200).send("Message envoyé avec succès.");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de l'envoi du message.");
    }
});
app.listen(port, () => {
    console.log(`Serveur lancé sur le port : ${port} !`);
});
