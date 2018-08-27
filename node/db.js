const { Client } = require('pg')
const client = new Client({
  connectionString: `postgresql://postgres:${process.env.POSTGRES_PASSWORD}@db/${process.env.POSTGRES_DB}`
})
const cache = require('./cache')

async function connect() {
  await client.connect()
}

async function createDummyData() {

  const DUMMY_DATA = [
    {
      name: 'Fountain Head',
      author: 'Ayn Rand'
    },
    {
      name: 'Fool me once',
      author: 'Harlan Coben'
    }
  ]

  const query = `SELECT EXISTS (
    SELECT 1
    FROM   information_schema.tables 
    WHERE  table_name = 'books'
    );`
  
  const tableExists = await client.query(query)
  if (!tableExists.rows[0].exists) {
    const createTable = `CREATE TABLE BOOKS (id serial, name text not null, author text not null)`
    await client.query(createTable)
    await Promise.all(DUMMY_DATA.map(async book => await client.query(`INSERT INTO BOOKS (NAME, AUTHOR) VALUES ('${book.name}', '${book.author}')`)))
    console.log('Created dummy data in db')
  }
}

async function getBooks() {
  const rows = await cache.get('books_all')

  console.log('Result from cache', rows)

  if (!rows) {
    const query = `SELECT * FROM BOOKS`
    const result = await client.query(query)
    await cache.set('books_all', JSON.stringify(result.rows))
    return result.rows
  } else {
    return JSON.parse(rows)
  }
}

async function createBook(input) {
  const result = await client.query(`INSERT INTO BOOKS (NAME, AUTHOR) VALUES ('${input.name}', '${input.author}') RETURNING *`)
  await cache.del('books_all')
  return result.rows
}

module.exports = {
  connect,
  createDummyData,
  getBooks,
  createBook
}