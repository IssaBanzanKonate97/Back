import mysql from "mysql"; // Importe le module mysql

import { db_database, db_host, db_user, db_password } from "./core.config"; // Importe les informations de configuration de la base de données depuis le fichier core.config.js

class Core { // Définit la classe Core
  constructor() {} // Définit un constructeur vide

  logError(error) { // Définit une méthode logError qui prend un argument: l'erreur à enregistrer
    return console.log(`Une erreur est survenue : ${ error }`); // Enregistre l'erreur dans la console avec un message personnalisé
  }

  async executeQuery(queryToExecute) { // Définit une méthode asynchrone executeQuery qui prend un argument: la requête SQL à exécuter
    try {
      const connection = mysql.createConnection({ // Crée une connexion à la base de données avec les informations de configuration de la base de données
        host: db_host,
        user: db_user,
        password: db_password,
        database: db_database,
      });
  
      connection.connect(); // Établit une connexion à la base de données
  
      connection.query( // Exécute la requête SQL fournie en argument
        queryToExecute,
        (error, results, fields) => { // Si la requête SQL retourne des résultats ou une erreur
          if (error) throw error; // Lance une erreur si une erreur se produit lors de l'exécution de la requête SQL
          console.log("results", results); // Affiche les résultats de la requête SQL dans la console
          return results // Renvoie les résultats de la requête SQL
        }
      );
  
      connection.end(); // Ferme la connexion à la base de données
    } catch (error) { // Si une erreur se produit pendant l'exécution de la méthode
      this.logError(error); // Enregistre l'erreur dans un fichier de log en appelant la méthode logError
    }
  }
}

export default Core; // Exporte la classe Core pour pouvoir être utilisée dans d'autres fichiers
