// interface.ts

export interface IClient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }
  
  export interface IAppointment {
    clientId: string;
    date: Date;
    type: string;
  }
  
  export interface IUser {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  