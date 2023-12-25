"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const Booking_1 = __importDefault(require("./services/Booking"));
const Practitioner_1 = __importDefault(require("./services/Practitioner"));
const cors_1 = __importDefault(require("cors"));
const port = process.env.PORT || 4000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/calendars/all", async (req, res) => {
    const booking = new Booking_1.default();
    return await booking.getCalendarsIdsFromAppointmentTypeId(req, res);
});
app.get("/availability", async (req, res) => {
    const booking = new Booking_1.default();
    await booking.getAvailability(req, res);
});
app.post("/api/become-practitioner", async (req, res) => {
    const practitionerService = new Practitioner_1.default();
    await practitionerService.handle(req, res);
});
app.listen(port, () => {
    console.log(`Serveur lancé sur le port : ${port} !`);
});
