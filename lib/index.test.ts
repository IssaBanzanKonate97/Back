import request from 'supertest';
import app from 'C:/wamp64/www/backend-projet-master/lib/index'; 

describe('Tests de l\'API', () => {
    it('GET /calendars/all devrait retourner un statut 200', async () => {
      const response = await request(app).get('/calendars/all');
      expect(response.status).toBe(200);
    });
  
    
  });
