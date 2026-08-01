const request = require('supertest');
const app = require('../src/app');
const expensesStore = require('../src/store/expensesStore');

describe('Smart Expense Tracker REST API Tests (Enterprise Suite)', () => {
  beforeEach(() => {
    // Reset store in pure memory mode before each test
    expensesStore.reset([
      {
        id: 'test-1',
        title: 'Lunch at Cafe',
        amount: 25.50,
        category: 'Food',
        date: '2026-07-28'
      },
      {
        id: 'test-2',
        title: 'Taxi Ride',
        amount: 40.00,
        category: 'Travel',
        date: '2026-07-29'
      },
      {
        id: 'test-3',
        title: 'Electricity Bill',
        amount: 100.00,
        category: 'Utilities',
        date: '2026-07-30'
      }
    ], false);
  });

  describe('GET /health', () => {
    it('should return 200 OK with server health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /expenses', () => {
    it('should create a new expense with valid payload and return 201', async () => {
      const payload = {
        title: 'New Books',
        amount: 50.25,
        category: 'Education',
        date: '2026-07-31'
      };

      const response = await request(app)
        .post('/expenses')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(payload.title);
      expect(response.body.amount).toBe(payload.amount);
      expect(response.body.category).toBe(payload.category);
      expect(response.body.date).toBe(payload.date);
    });

    it('should return 400 Bad Request when sending malformed JSON body', async () => {
      const response = await request(app)
        .post('/expenses')
        .set('Content-Type', 'application/json')
        .send('{"title": "Broken JSON');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toContain('Invalid JSON payload syntax');
    });

    it('should return 400 if title is missing or empty', async () => {
      const payload = {
        title: '   ',
        amount: 20,
        category: 'Food',
        date: '2026-07-31'
      };

      const response = await request(app)
        .post('/expenses')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Failed');
    });

    it('should return 400 if title exceeds 150 characters', async () => {
      const payload = {
        title: 'A'.repeat(151),
        amount: 20,
        category: 'Food',
        date: '2026-07-31'
      };

      const response = await request(app)
        .post('/expenses')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('title cannot exceed 150 characters');
    });

    it('should return 400 if amount is non-positive or invalid', async () => {
      const payload = {
        title: 'Gym Membership',
        amount: -15,
        category: 'Health',
        date: '2026-07-31'
      };

      const response = await request(app)
        .post('/expenses')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Failed');
    });

    it('should return 400 if date string format is invalid', async () => {
      const payload = {
        title: 'Dinner',
        amount: 35.00,
        category: 'Food',
        date: '31-07-2026'
      };

      const response = await request(app)
        .post('/expenses')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Failed');
    });

    it('should return 400 for impossible calendar date like 2026-02-30', async () => {
      const payload = {
        title: 'Leap Year Check',
        amount: 50.00,
        category: 'Utilities',
        date: '2026-02-30'
      };

      const response = await request(app)
        .post('/expenses')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Failed');
    });
  });

  describe('GET /expenses/:id', () => {
    it('should fetch a single expense by ID and return 200', async () => {
      const response = await request(app).get('/expenses/test-1');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('test-1');
      expect(response.body.title).toBe('Lunch at Cafe');
      expect(response.body.amount).toBe(25.50);
    });

    it('should return 404 if expense with specified ID is not found', async () => {
      const response = await request(app).get('/expenses/non-existent-999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('PUT /expenses/:id', () => {
    it('should update an existing expense and return 200', async () => {
      const payload = {
        title: 'Lunch at Cafe (Updated)',
        amount: 30.00
      };

      const response = await request(app)
        .put('/expenses/test-1')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('test-1');
      expect(response.body.title).toBe(payload.title);
      expect(response.body.amount).toBe(payload.amount);
      expect(response.body.category).toBe('Food');
    });

    it('should return 404 when updating non-existent expense ID', async () => {
      const response = await request(app)
        .put('/expenses/missing-id')
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('GET /expenses', () => {
    it('should return all expenses with status 200', async () => {
      const response = await request(app).get('/expenses');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it('should filter expenses by category query param', async () => {
      const response = await request(app).get('/expenses?category=Food');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].category).toBe('Food');
    });

    it('should filter expenses by search query param', async () => {
      const response = await request(app).get('/expenses?search=taxi');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Taxi Ride');
    });

    it('should filter expenses by date range (startDate & endDate)', async () => {
      const response = await request(app).get('/expenses?startDate=2026-07-29&endDate=2026-07-30');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.some(e => e.id === 'test-2')).toBe(true);
      expect(response.body.some(e => e.id === 'test-3')).toBe(true);
    });
  });

  describe('GET /expenses/total', () => {
    it('should return overall total and total by category', async () => {
      const response = await request(app).get('/expenses/total');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('overall');
      expect(response.body).toHaveProperty('byCategory');
      expect(response.body.overall).toBe(165.50);
      expect(response.body.byCategory.Food).toBe(25.50);
      expect(response.body.byCategory.Travel).toBe(40.00);
      expect(response.body.byCategory.Utilities).toBe(100.00);
    });
  });

  describe('GET /expenses/monthly-summary (Bonus Endpoint)', () => {
    it('should return aggregated monthly summary list', async () => {
      const response = await request(app).get('/expenses/monthly-summary');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].month).toBe('2026-07');
      expect(response.body[0].totalAmount).toBe(165.50);
      expect(response.body[0].topCategory).toBe('Utilities');
    });
  });

  describe('GET /expenses/export/csv', () => {
    it('should return downloadable CSV content', async () => {
      const response = await request(app).get('/expenses/export/csv');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('ID,Title,Amount,Category,Date');
      expect(response.text).toContain('Lunch at Cafe');
    });
  });

  describe('DELETE /expenses/:id', () => {
    it('should delete an existing expense and return 200', async () => {
      const response = await request(app).delete('/expenses/test-1');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('test-1');

      const getResponse = await request(app).get('/expenses');
      expect(getResponse.body.length).toBe(2);
      expect(getResponse.body.find(e => e.id === 'test-1')).toBeUndefined();
    });

    it('should return 404 when deleting a non-existent expense ID', async () => {
      const response = await request(app).delete('/expenses/non-existent-id-999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('Fallback & Unknown Routes', () => {
    it('should return 404 JSON for undefined routes', async () => {
      const response = await request(app).get('/unknown-route-path');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });
  });
});
