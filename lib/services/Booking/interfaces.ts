export interface AcuityConfiguration {
  user: string;
  password: string;
  endpoint: string;
  defaultAppointmentTypeID: number;
}

export interface AcuityAppointmentType {
  id: number;
  active: boolean;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  color: string;
  private: boolean;
  type: string;
  classSize: number;
  paddingAfter: number;
  paddingBefore: number;
  calendarIDs: number[];
}

export interface AcuityCalendar {
  id: number;
  name: string;
  email: string;
  replyTo: string;
  description: string;
  location: string;
  timezone: string;
}

export interface AcuityAppointmentDate {
  date: Date;
}

export interface AcuityAppointmentTime {
  time: string;
  slotsAvailable: number;
}