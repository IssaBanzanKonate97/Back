"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const Database_1 = __importDefault(require("../Database"));
class Auth {
    db;
    constructor() {
        this.db = new Database_1.default();
    }
    async signUp(firstName, lastName, email, password) {
        try {
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const query = `INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)`;
            const result = await this.db.query(query, [firstName, lastName, email, hashedPassword]);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = Auth;
