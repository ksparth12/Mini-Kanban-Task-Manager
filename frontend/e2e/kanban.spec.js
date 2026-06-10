import { expect, test } from '@playwright/test';

const API_URL = 'http://127.0.0.1:4000';

const clearTasks = async (request) => {
  const response = await request.get(`${API_URL}/tasks`);
  const tasks = await response.json();

  for (const task of tasks) {
    await request.delete(`${API_URL}/tasks/${task.id}`);
  }
};

const getTaskFromColumn = async (column, taskTitle) => {
  const card = column.getByTestId('task-card').filter({ hasText: taskTitle });
  await expect(card).toHaveCount(1);
  return card.first();
};

test.describe('Mini Kanban Task Manager E2E', () => {
  test.beforeEach(async ({ request, page }) => {
    await clearTasks(request);
    await page.goto('/');
  });

  test('creates tasks and groups them into To Do', async ({ page }) => {
    await page.getByPlaceholder('Buy milk').fill('Write tests');
    await page.getByTestId('add-task-button').click();

    const todoColumn = page.getByTestId('todo-column');
    await expect(todoColumn.getByText('Write tests')).toBeVisible();
    await expect(todoColumn.getByText('todo')).toBeVisible();
  });

  test('moves a task from To Do to Done and back', async ({ page }) => {
    await page.getByPlaceholder('Buy milk').fill('Build UI');
    await page.getByTestId('add-task-button').click();

    const todoColumn = page.getByTestId('todo-column');
    const doneColumn = page.getByTestId('done-column');

    const todoTask = await getTaskFromColumn(todoColumn, 'Build UI');
    await todoTask.getByRole('button', { name: 'Mark as Done' }).click();

    await expect(doneColumn.getByText('Build UI')).toBeVisible();
    await expect(todoColumn.getByText('Build UI')).toHaveCount(0);

    const doneTask = await getTaskFromColumn(doneColumn, 'Build UI');
    await doneTask.getByRole('button', { name: 'Move to To Do' }).click();

    await expect(todoColumn.getByText('Build UI')).toBeVisible();
    await expect(doneColumn.getByText('Build UI')).toHaveCount(0);
  });

  test('moves a task using drag and drop', async ({ page }) => {
    await page.getByPlaceholder('Buy milk').fill('Drag task');
    await page.getByTestId('add-task-button').click();

    const todoColumn = page.getByTestId('todo-column');
    const doneColumn = page.getByTestId('done-column');

    const dragCard = todoColumn
      .getByTestId('task-card')
      .filter({ hasText: 'Drag task' })
      .first();

    await dragCard.dragTo(doneColumn);

    await expect(doneColumn.getByText('Drag task')).toBeVisible();
    await expect(todoColumn.getByText('Drag task')).toHaveCount(0);

    const doneCard = doneColumn
      .getByTestId('task-card')
      .filter({ hasText: 'Drag task' })
      .first();

    await doneCard.dragTo(todoColumn);

    await expect(todoColumn.getByText('Drag task')).toBeVisible();
    await expect(doneColumn.getByText('Drag task')).toHaveCount(0);
  });

  test('deletes a task', async ({ page }) => {
    await page.getByPlaceholder('Buy milk').fill('Delete later');
    await page.getByTestId('add-task-button').click();

    const todoColumn = page.getByTestId('todo-column');
    const task = await getTaskFromColumn(todoColumn, 'Delete later');
    await task.getByRole('button', { name: 'Delete' }).click();

    await expect(todoColumn.getByText('Delete later')).toHaveCount(0);
    await expect(page.getByTestId('todo-column').getByText('No tasks yet')).toBeVisible();
  });
});
