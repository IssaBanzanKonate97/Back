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
const Database_1 = __importDefault(require("./services/Database"));
// import { smtpConfig } from "./services/Contact/contact.config";
const cors_1 = __importDefault(require("cors"));
const port = process.env.PORT;
if (!port) {
    console.error("La variable d'environnement PORT n'est pas définie.");
    process.exit(1);
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
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
/*app.get("/practitioners", async (req, res) => {
  try {
    const practitionerService = new PractitionerService();
    const practitioners = await practitionerService.getAllPractitioners(); // Cette méthode doit être implémentée
    res.json(practitioners);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la récupération des praticiens.");
  }
});*/
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
    console.log(`req1 = ${req.body}`);
    console.log(`req2 = ${JSON.stringify(req.body)}`);
    const booking = new Booking_1.default();
    await booking.createAppointment(req, res);
});
app.get('/', (req, res) => {
    const links = [];
    app._router.stack.forEach(function (route) {
        if (route.route && route.route.path && route.route.path !== '/') {
            links.push(`<a href='${route.route.path}'>${route.route.path}</a>`);
        }
    });
    return res.send(`API fonctionne<br>${links.join('<br>')}`);
});
app.post('/login', async (req, res) => {
    console.log(`req1 = ${req.body}`);
    console.log(`req2 = ${JSON.stringify(req.body)}`);
    const bookingService = new Booking_1.default();
    await bookingService.loginUser(req, res);
});
//app.get('/api/clients', async (req, res) => {
// const booking = new Booking();
// await booking.getAllClients(req, res);
//});
app.get('/api/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const db = new Database_1.default();
        const user = await db.findUserById(userId);
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).send('Utilisateur non trouvé');
        }
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l’utilisateur:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});
app.post("/api/contact", async (req, res) => {
    const contactService = new contact_service_1.ContactService();
    try {
        await contactService.sendMail(req.body);
        res.status(200).send("Message envoyé avec succès.");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de l'envoi du message.");
    }
});
app.post('/api/create-client', async (req, res) => {
    const booking = new Booking_1.default();
    await booking.createClient(req, res);
});
app.listen(port, () => {
    console.log(`Serveur lancé sur le port : ${port} !`);
});
exports.default = app;
