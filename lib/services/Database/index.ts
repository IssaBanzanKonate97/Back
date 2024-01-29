import mysql from "mysql";
import db_config from "./database.config";
import bcrypt from 'bcrypt';

class Database {
  private connection: mysql.Connection;

  constructor() {
    this.connection = mysql.createConnection({
      host: db_config.server,
      user: db_config.user,
      password: db_config.password,
      database: db_config.database,
    });

    this.connection.connect((err) => {
      if (err) {
        console.error("Impossible de se connecter à la base de données", err);
        process.exit(1);
      }
    });
  }

  public query(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
 
  
  private validatePhoneNumber(phone: string): boolean {
    // Accepte les formats internationaux et les formats nationaux avec ou sans tirets
    return /^(\+\d{1,3}\d{6,12}|\d{2}(-\d{2}){4})$/.test(phone);
  }
  public async createUser(firstName: string, lastName: string, email: string, phone: string, plainPassword: string): Promise<number> {
    if (!this.validatePhoneNumber(phone)) {
      throw new Error("Numéro de téléphone invalide. Seuls les chiffres sont autorisés.");
    }
    // Le mot de passe est utilisé tel quel, sans hachage
    const password = plainPassword;

    const sql = `INSERT INTO users (first_name, last_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)`;
    const params = [firstName, lastName, email, phone, password];

    const result = await this.query(sql, params);
    return result.insertId;
  }
  
  
  
  
  public findUserByEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, password_hash FROM users WHERE email = ?';
      this.connection.query(sql, [email], (err, results) => {
        if (err) {
          console.error('Erreur lors de la recherche de l’utilisateur:', err);
          reject(err);
        } else if (results.length > 0) {
          console.log('Utilisateur trouvé:', results[0]);
          resolve(results[0]);
        } else {
          resolve(null); // Aucun utilisateur trouvé, donc renvoyez null
        }
      });
    });
  }
  
  async findUserById(userId) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await this.query(sql, [userId]);
    if (results.length > 0) {
      return results[0];
    } else {
      return null;
    }
  }
  
  
  
  
  
  
    

  public createAppointement(user_id: Number, appointment_type_id: Number, calendar_id: Number, date: string, time: string) {
    // Format the time to ensure it has the correct format for a SQL TIME field
    const formattedTime = `${time}:00`;
  
    // Use placeholders '?' for parameterized queries to prevent SQL injection
    const sql = `INSERT INTO appointments (user_id, appointment_type_id, calendar_id, date, time) VALUES (?, ?, ?, ?, ?)`;
  
    // The parameters must be in an array and match the order of the placeholders in the query
    const params = [user_id, appointment_type_id, calendar_id, date, formattedTime];
  
    // Execute the parameterized query
    this.query(sql, params)
      .then(results => {
        console.log(`Resultat createAppointement :\n${results}`);
      }).catch(err => {
        console.log(`Une erreur s'est produite pour createAppointement\n${err}`);
      });
  }
  
}

export default Database;
