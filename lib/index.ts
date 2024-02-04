import "dotenv/config";

import express from "express";
import Booking from "./services/Booking";
import PractitionerService from "./services/Practitioner";
import { ContactService } from "./services/Contact/contact.service";
import Database from "./services/Database";
import axios from 'axios';
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
  app._router.stack.forEach(function (route) {
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

app.get('/api/user/:acuityUserId', async (req, res) => {
  try {
    const { acuityUserId } = req.params;
    const db = new Database();
    const user = await db.findUserById(acuityUserId);
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


app.put('/api/user/:acuityUserId', async (req, res) => {
  try {
    const { acuityUserId } = req.params;
    const { Lastname, Firstname, Mail, Mobile } = req.body;

    const db = new Database();
    await db.updateUser(Number(acuityUserId), Firstname, Lastname, Mail, Mobile);

    res.json({ message: 'Informations de l’utilisateur mises à jour avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});
app.get('/api/appointments/user/:acuityUserId', async (req, res) => {
  try {
    const { acuityUserId } = req.params;
    const db = new Database();
    const appointments = await db.getAppointmentsByUserId(Number(acuityUserId));
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments for user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/appointments/:id/reschedule', async (req, res) => {
  const { id } = req.params;
  const { newDate, newTime } = req.body;


  const newDateTimeISO = new Date(`${newDate}T${newTime}`).toISOString();


  const authHeader = {
    'Authorization': `Basic ${Buffer.from(`${process.env.ACUITY_USER_ID}:${process.env.ACUITY_API_KEY}`).toString('base64')}`,
    'Content-Type': 'application/json'
  };


  const url = `${process.env.ACUITY_BASE_URL}/appointments/${id}/reschedule`;

  try {

    const acuityResponse = await axios.put(url, { datetime: newDateTimeISO }, { headers: authHeader });

    const db = new Database();
    await db.updateAppointment(newDate, newTime, id);


    res.json({ message: 'Le rendez-vous a été reprogrammé avec succès.', data: acuityResponse.data });
  } catch (error) {
    console.error('Erreur lors de la connexion à l\'API Acuity ou de la mise à jour de la base de données :', error);

    if (error.response) {
      res.status(error.response.status).json({ message: 'Erreur lors de la reprogrammation avec l\'API Acuity', details: error.response.data });
    } else {

      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
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

