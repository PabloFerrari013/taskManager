import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { v4 as uuid } from 'uuid'

dotenv.config()
const port = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function verifyIfExistsUser(req, res, next) {
  const { username } = req.header

  const user = users.find(user => users.username === username)

  if (!user) return res.status(404).json({ error: 'User not found' })

  req.user = user

  return next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const userAlreadyExists = users.find(user => user.username === username)

  if (userAlreadyExists)
    return res.status(400).json({ error: 'user already exists' })

  users.push({ id: uuid(), name, username, todos: [] })

  return res.status(201).send('ok!')
})

app.get('/todos', verifyIfExistsUser, (req, res) => {
  const { user } = req

  return res.json(user)
})

app.post('/todos', verifyIfExistsUser, (req, res) => {
  const { title, deadline } = req.body
  const { user } = req

  const data = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(data)

  return res.status(201).json(data)
})

app.put('/todos/:id', verifyIfExistsUser, (req, res) => {
  const { title, deadline } = req.body
  const { user } = req
  const { id } = req.params

  const indexOfIdInArray = user.todos.findIndex(todo => todo.id === id)

  if (indexOfIdInArray === -1)
    return res.status(404).json({ error: 'todos not found' })

  user.todos[indexOfIdInArray].title = title
  user.todos[indexOfIdInArray].deadline = new Date(deadline)

  return res.status(201).json(user.todos[indexOfIdInArray])
})

app.patch('/todos/:id/done', verifyIfExistsUser, (req, res) => {
  const { user } = req
  const { id } = req.params

  const indexOfIdInArray = user.todos.findIndex(todo => todo.id === id)

  if (indexOfIdInArray === -1)
    return res.status(404).json({ error: 'todos not found' })

  user.todos[indexOfIdInArray].done = true

  return res.status(201).json(user.todos[indexOfIdInArray])
})

app.delete('/todos/:id', verifyIfExistsUser, (req, res) => {
  const { user } = req
  const { todos } = user
  const { id } = req.params

  console.log(todos)
  console.log(id)

  const indexOfIdInArray = todos.findIndex(todo => todo.id === id)

  if (indexOfIdInArray === -1)
    return res.status(404).json({ error: 'todos not found' })

  todos.splice(indexOfIdInArray, 1)

  return res.send('ok!')
})

app.listen(port, () => console.log('server running on the port: ' + port))
