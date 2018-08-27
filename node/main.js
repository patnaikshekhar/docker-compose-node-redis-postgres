const express = require('express')
const app = express()
const DB = require('./db')
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.get('/', async (req, res) => {
  const result = await DB.getBooks()
  res.json(result)
})

app.post('/', async (req, res) => {
  const result = await DB.createBook(req.body)
  res.json(result)
})

async function start() {
  
  await DB.connect()
  await DB.createDummyData()
  
  app.listen(80, () => {
    console.log('Server started')
  })
}

start()

