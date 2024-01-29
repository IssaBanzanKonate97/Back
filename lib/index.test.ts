import request from 'supertest';
import app from 'C:/wamp64/www/backend-projet-master/lib/index'; 

describe('Tests de l\'API', () => {
    it('GET /api/become-practitioner devrait retourner un statut 200', async () => {
      const response = await request(app).get('/api/become-practitioner');
      expect(response.status).toBe(200);
    });
  
    it('GET /appointment-types/alldevrait retourner un statut 200', async () => {
      const response = await request(app).get('/appointment-types/all');
      expect(response.status).toBe(200);
    });

    it('GET /api/book-appointment devrait retourner un statut 200', async () => {
      const response = await request(app).get('/api/book-appointment');
      expect(response.status).toBe(200);
    });

    it('GET /api/contact devrait retourner un statut 200', async () => {
      const response = await request(app).get('/api/contact');
      expect(response.status).toBe(200);
    });

    it('GET /api/create-client devrait retourner un statut 200', async () => {
      const response = await request(app).get('/api/create-client');
      expect(response.status).toBe(200);
    });
  });
