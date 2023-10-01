"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Booking_1 = __importDefault(require("../Booking")); // Importe la classe Core depuis le fichier ../Core
class Auth extends Booking_1.default {
    // Définit une classe Auth qui hérite de la classe Core
    constructor() {
        super(); // Appelle le constructeur de la classe parente
    }
}
exports.default = Auth; // Exporte la classe Auth pour pouvoir être utilisée dans d'autres fichiers
