import "dotenv/config";
import express from "express";
import Booking from "./services/Booking";
import PractitionerService from "./services/Practitioner";

import cors from "cors";

const port = process.env.PORT || 4000;

const app = express();

app.use(cors());

app.use(express.json());

app.get("/calendars/all", async (req, res) => {
  const booking = new Booking();

  const calendars = await booking.getAllCalendars();

  res.send({ calendars });
});

app.get("/availability", async (req, res) => {
  const booking = new Booking();

  await booking.getAvailability(req, res);
});

app.post("/api/become-practitioner", async (req, res) => {
  const practitionerService = new PractitionerService();

  practitionerService.logError("test");

  await practitionerService.handle(req, res);
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port : ${port} !`);
});
