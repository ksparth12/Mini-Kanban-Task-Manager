const request = require('supertest');
const { app, resetTasks } = require('../server');

describe('Tasks API', () => {
  beforeEach(() => {
    resetTasks();
  });

  test('GET /tasks returns all tasks', async () => {
    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('POST /tasks creates a task with default status todo', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Buy milk' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 1,
      title: 'Buy milk',
      status: 'todo',
    });

    const fetchResponse = await request(app).get('/tasks');
    expect(fetchResponse.body).toHaveLength(1);
  });

  test('POST /tasks validates non-empty title', async () => {
    const response = await request(app).post('/tasks').send({ title: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Title is required');
  });

  test('PUT /tasks/:id updates status between todo and done', async () => {
    const create = await request(app).post('/tasks').send({ title: 'Read docs' });
    const id = create.body.id;

    const update = await request(app)
      .put(`/tasks/${id}`)
      .send({ status: 'done' });

    expect(update.status).toBe(200);
    expect(update.body.status).toBe('done');

    const fetchResponse = await request(app).get('/tasks');
    expect(fetchResponse.body[0].status).toBe('done');
  });

  test('PUT /tasks/:id rejects invalid status', async () => {
    const create = await request(app).post('/tasks').send({ title: 'Invalid status test' });
    const id = create.body.id;

    const response = await request(app)
      .put(`/tasks/${id}`)
      .send({ status: 'in-progress' });

    expect(response.status).toBe(400);
  });

  test('DELETE /tasks/:id removes a task', async () => {
    const create = await request(app).post('/tasks').send({ title: 'Task to delete' });
    const id = create.body.id;

    const remove = await request(app).delete(`/tasks/${id}`);
    expect(remove.status).toBe(204);

    const after = await request(app).get('/tasks');
    expect(after.body).toHaveLength(0);
  });
});
