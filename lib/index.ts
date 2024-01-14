import "dotenv/config";
import express from "express";
import Booking from "./services/Booking";
import PractitionerService from "./services/Practitioner";
import { ContactService } from "./services/Contact/contact.service";
import { smtpConfig } from "./services/Contact/contact.config";

import cors = require("cors");

const port = process.env.PORT || 4000;

const app = express();

app.use(cors());

app.use(express.json());

app.get("/calendars/all", async (req, res) => {
  const booking = new Booking();
  return await booking.getCalendarsIdsFromAppointmentTypeId(req, res);
});

app.get("/fetch_appointment_dates", async (req, res) => {
  const booking = new Booking();
  await booking.fetchAppointmentDates(req, res);
});

app.get("/fetch_appointment_times", async (req, res) => {
  const booking = new Booking();
  await booking.fetchAppointmentTimes(req, res);
});

app.post("/api/become-practitioner", async (req, res) => {
  const practitionerService = new PractitionerService();

  await practitionerService.handle(req, res);
});

app.get("/appointment-types/all", async (req, res) => {
  const booking = new Booking();
  try {
    const appointmentTypes = await booking.getAllAppointmentTypes();
    res.json(appointmentTypes);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});
app.post('/api/book-appointment', async (req, res) => {
  const booking = new Booking();
  await booking.createAppointment(req, res);
});

app.get('/', (req, res) => {
  const links = [];
  app._router.stack.forEach(function(app: { route: { path: any; }; }){
    if (app.route && app.route.path && app.route.path !== '/'){
      links.push(`<a href='${app.route.path}'>${app.route.path}</a>`);
    }
  });
  return res.send(`API fonctionne<br>${links.join('<br>')}`);
});

app.post("/api/contact", async (req, res) => {
  const contactService = new ContactService(smtpConfig);
  try {
    await contactService.sendMail(req.body);
    res.status(200).send("Message envoyé avec succès.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'envoi du message.");
  }
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port : ${port} !`);
});
