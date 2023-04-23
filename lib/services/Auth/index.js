import Core from "../Core";

class Auth extends Core {
    constructor(){
        super()
    }

    async loginUser(username, password) {
        try {
            // On vérifie si l'email et le mot de passes sont bien renseignées
            if (!username || !password) {
                throw "Le nom d'utilisateur ou le mot de passe n'est pas renseigné"
            }

            // On va verifier dans la base de donnée, si l'utilisateur existe
            // Echapper les charactères ?? pour eviter les injections SQL ///
            const query = `SELECT count(*) FROM membres WHERE Identifiant = '${ username }' AND Mot_de_Passe = '${ password }'`;

            await this.executeQuery(query);
        } catch (error) {
            this.logError(error);
        }
    }
}
export default Auth;