import mysql from "mysql";
import { db_database, db_host, db_user, db_password } from "./core.config";

class Core {
  constructor() {}

  logError(error) {
    return console.log(`Une erreur est survenue : ${ error }`);
  }

  async executeQuery(queryToExecute) {
    try {
      const connection = mysql.createConnection({
        host: db_host,
        user: db_user,
        password: db_password,
        database: db_database,
      });
  
      connection.connect();
  
      connection.query(
        queryToExecute,
        (error, results, fields) => {
          if (error) throw error;
          console.log("results", results);
          return results
        }
      );
  
      connection.end();
    } catch (error) {
      this.logError(error);
    }
  }
}

export default Core;
