import request from 'supertest';
import app from 'C:/wamp64/www/backend-projet-master/lib/index'; 

describe('POST /login', () => {
  it('should return a success response for valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'badre@yahoo.fr',
        password: 'Badre'
      });

    expect(response.statusCode).toBe(200);
    // Ajoutez ici d'autres assertions selon ce que votre route retourne
    // Par exemple : expect(response.body).toHaveProperty('token');
  });

  // Vous pouvez ajouter d'autres tests pour couvrir différents cas d'utilisation, comme des identifiants invalides
});