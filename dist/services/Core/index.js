"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class Core {
    constructor() { }
    logError(error) {
        return console.log(`Une erreur est survenue : ${error}`);
    }
    logSuccess(message) {
        return console.log(`[SUCCESS] ${message}`);
    }
    network = async (method, url, headers = {
        "Content-Type": "application/json",
    }, data = {}) => {
        const response = await (0, axios_1.default)({
            method,
            url,
            headers,
            data,
        });
        if (response.status !== 200) {
            throw new Error(response.statusText);
        }
        return response.data;
    };
    get = async (url, headers = {}) => {
        return (await this.network("GET", url, headers));
    };
    post = async (url, headers = {}, data) => {
        return (await this.network("POST", url, headers, data));
    };
    getQueryParams = (request, key, isRequired = true) => {
        const value = request.query[key];
        if (!value && isRequired) {
            throw new Error(`Query param ${key} is missing`);
        }
        if (!value && !isRequired) {
            return undefined;
        }
        return `${value}`;
    };
}
exports.default = Core;
