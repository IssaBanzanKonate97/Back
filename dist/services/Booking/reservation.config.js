"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acuityConfiguration = void 0;
const acuityConfiguration = {
    user: process.env.ACUITY_USER || "user",
    password: process.env.ACUITY_PASSWORD || "password",
    endpoint: process.env.ACUITY_ENDPOINT || "https://acuityscheduling.com/api/v1",
};
exports.acuityConfiguration = acuityConfiguration;
