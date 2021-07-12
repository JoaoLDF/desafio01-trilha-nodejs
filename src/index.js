const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkUsername(username) {
  const usernameExist = users.find(user => user.username === username);

  return usernameExist;
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = checkUsername(username);

  if (user) {
    request.body.user = user;

    return next();
  }

  return response.status(404).json({ error: 'Not Found' })
}

function checkTodoIndex(todoId, user) {
  const todoMap = user.todos.map(todo => todo.id === todoId);

  const todoIndex = todoMap.indexOf(true);

  return todoIndex;
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (!checkUsername(username)) {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    };

    users.push(user);

    return response.status(201).json(user);
  }

  return response.status(400).json({ error: 'This username is not available' })
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.body.user;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline, user } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  let { title, deadline, user } = request.body;
  const { id } = request.params;

  const todoIndex = checkTodoIndex(id, user);

  if (todoIndex != -1) {
    let todo = user.todos[todoIndex];

    let updadedTodo = {
      id: id,
      title: title,
      done: todo.done,
      deadline: new Date(deadline),
      created_at: todo.created_at
    };

    user.todos.splice(todoIndex, 1, updadedTodo);

    return response.status(200).json(updadedTodo);
  }

  return response.status(404).json({ error: "Not Found" });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  let { user } = request.body;
  const { id } = request.params;

  const todoIndex = checkTodoIndex(id, user);

  if (todoIndex != -1) {
    let todo = user.todos[todoIndex];

    let updadedTodo = {
      id: id,
      title: todo.title,
      done: true,
      deadline: todo.deadline,
      created_at: todo.created_at
    };

    user.todos.splice(todoIndex, 1, updadedTodo);

    return response.status(200).json(updadedTodo);
  }

  return response.status(404).json({ error: "Not Found" });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  let { user } = request.body;

  const todoIndex = checkTodoIndex(id, user);

  if (todoIndex != -1) {
    user.todos.splice(todoIndex, 1);

    return response.status(204).json();
  }

  return response.status(404).json({ error: "Not Found" });
});

module.exports = app;