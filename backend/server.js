const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
const tasksRouter = express.Router();

let tasks = [];
let nextId = 1;

const resetTasks = () => {
  tasks = [];
  nextId = 1;
};

const isValidStatus = (status) => status === 'todo' || status === 'done';

tasksRouter.get('/tasks', (_, res) => {
  res.status(200).json(tasks);
});

tasksRouter.post('/tasks', (req, res) => {
  const { title } = req.body || {};
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Title is required and must be a non-empty string.',
    });
  }

  const task = { id: nextId++, title: title.trim(), status: 'todo' };
  tasks.push(task);
  return res.status(201).json(task);
});

tasksRouter.put('/tasks/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Task id must be a number.' });
  }

  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const { status } = req.body || {};
  if (!isValidStatus(status)) {
    return res
      .status(400)
      .json({ error: 'Status must be either "todo" or "done".' });
  }

  task.status = status;
  return res.status(200).json(task);
});

tasksRouter.delete('/tasks/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Task id must be a number.' });
  }

  const index = tasks.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  tasks = tasks.filter((item) => item.id !== id);
  return res.status(204).send();
});

const serviceRoutePrefix = process.env.VERCEL_SERVICE_ROUTE_PREFIX || '';
app.use(serviceRoutePrefix, tasksRouter);
app.use(tasksRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

const handler = (req, res) => app(req, res);

handler.app = app;
handler.resetTasks = resetTasks;

module.exports = handler;
