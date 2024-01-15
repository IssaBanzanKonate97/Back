import "dotenv/config";
import type { AcuityConfiguration } from "./interfaces";

const acuityConfiguration: AcuityConfiguration = {
  user: process.env.ACUITY_USER_ID || "user",
  password: process.env.ACUITY_API_KEY || "password",
  endpoint:
    process.env.ACUITY_BASE_URL || "https://acuityscheduling.com/api/v1",
  defaultAppointmentTypeID:
    Number(process.env.FREE_RDV_BOOKING_APPOINTMENT_TYPE_ID) || 0,
};

export { acuityConfiguration };
