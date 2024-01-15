import axios from "axios";
import { Request } from "express";

class Core {
  constructor() {}

  public logError(error: any) {
    return console.log(`Une erreur est survenue : ${error}`);
  }

  public logSuccess(message: string) {
    return console.log(`[SUCCESS] ${message}`);
  }

  protected network = async (
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    headers: any = {
      "Content-Type": "application/json",
    },
    data: any = {}
  ): Promise<Response> => {
    const response = await axios({
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

  public get = async <T>(url: string, headers = {}): Promise<T> => {
    return (await this.network("GET", url, headers)) as unknown as T;
  };

  public post = async <T>(url: string, headers = {}, data: any): Promise<T> => {
    return (await this.network("POST", url, headers, data)) as unknown as T;
  };

  public getQueryParams = (
    request: Request,
    key: string,
    isRequired = true
  ): string | undefined => {
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

export default Core;
