import Core from "../Core";
import db_config from "./database.config";
import type { DatabaseConfiguration } from "./interfaces";
import mysql from "mysql";

class Database extends Core {
  config: DatabaseConfiguration;
  connection: mysql.Connection;
  constructor() {
    super();
    this.config = db_config;
    this.connection = this.connect();
  }

  private connect(): mysql.Connection {
    const connection = mysql.createConnection({
      host: this.config.server,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
    });

    connection.connect((err) => {
      if (err) {
        this.logError("Impossible de se connecter à la base de données");
      }
    });

    return connection;
  }

  public async query(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
}

export default Database;
