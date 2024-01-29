import "dotenv/config";

import express from "express";
import Booking from "./services/Booking";
import PractitionerService from "./services/Practitioner";
import { ContactService } from "./services/Contact/contact.service";
import Database from "./services/Database";
// import { smtpConfig } from "./services/Contact/contact.config";

import cors from 'cors';

const port = process.env.PORT;

if (!port) {
  console.error("La variable d'environnement PORT n'est pas définie.");
  process.exit(1);
}

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
  console.log(`req1 = ${req.body}`)
  console.log(`req2 = ${JSON.stringify(req.body)}`)
  const booking = new Booking();
  await booking.createAppointment(req, res);
});

app.get('/', (req, res) => {
  const links = [];
  app._router.stack.forEach(function(route) {
    if (route.route && route.route.path && route.route.path !== '/') {
      links.push(`<a href='${route.route.path}'>${route.route.path}</a>`);
    }
  });
  return res.send(`API fonctionne<br>${links.join('<br>')}`);
});

app.post('/login', async (req, res) => {
  console.log(`req1 = ${req.body}`)
  console.log(`req2 = ${JSON.stringify(req.body)}`)
  const bookingService = new Booking();
  await bookingService.loginUser(req, res);
});


//app.get('/api/clients', async (req, res) => {
 // const booking = new Booking();
 // await booking.getAllClients(req, res);
//});

app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = new Database();
    const user = await db.findUserById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('Utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l’utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});



app.post("/api/contact", async (req, res) => {

  const contactService = new ContactService();
  try {
    await contactService.sendMail(req.body);
    res.status(200).send("Message envoyé avec succès.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'envoi du message.");
  }
});

app.post('/api/create-client', async (req, res) => {
  const booking = new Booking();
  await booking.createClient(req, res);
});


app.listen(port, () => {
  console.log(`Serveur lancé sur le port : ${port} !`);
});
export default app;

