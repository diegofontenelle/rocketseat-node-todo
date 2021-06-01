const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(u => u.username  === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

function checkTodoExists(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(t => t.id === id);

  console.log(todo, user);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(u => u.username === username);

  if (userExists) {
    return response.status(400).json({
      error: 'Username in use'
    });
  }

  const user = { 
      id: uuidv4(),
      name, 
      username, 
      todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { deadline, title } = request.body;

  const todo = {
    id: uuidv4(),
    created_at: new Date(),
    deadline: new Date(deadline),
    done: false,
    title,
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { deadline, title } = request.body;
  const { todo } = request;

  todo.deadline = deadline;
  todo.title = title;

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todo, user } = request;

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;