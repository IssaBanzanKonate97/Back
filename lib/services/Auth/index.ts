import Core from "../Booking"; // Importe la classe Core depuis le fichier ../Core

class Auth extends Core {
  // Définit une classe Auth qui hérite de la classe Core
  constructor() {
    super(); // Appelle le constructeur de la classe parente
  }

  //   async loginUser(username, password) {
  //     // Définit une méthode asynchrone loginUser qui prend deux arguments: le nom d'utilisateur et le mot de passe
  //     try {
  //       if (!username || !password) {
  //         // Vérifie si l'un des deux paramètres est manquant
  //         throw "Le nom d'utilisateur ou le mot de passe n'est pas renseigné"; // Lance une exception avec un message d'erreur si l'un des deux paramètres est manquant
  //       }

  //       const query = `SELECT count(*) FROM membres WHERE Identifiant = '${username}' AND Mot_de_Passe = '${password}'`; // Crée une chaîne de requête SQL pour vérifier si l'utilisateur existe et échappe les caractères pour éviter les injections SQL

  //       await this.executeQuery(query); // Exécute la requête SQL créée précédemment
  //     } catch (error) {
  //       this.logError(error); // Enregistre l'erreur dans un fichier de log si une erreur se produit lors de l'exécution de la requête SQL ou lors de la vérification des données d'entrée
  //     }
  //   }
}
export default Auth; // Exporte la classe Auth pour pouvoir être utilisée dans d'autres fichiers
