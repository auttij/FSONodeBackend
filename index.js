const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(morgan('tiny'))
app.use(express.json())

persons = [
	{
		id: 1,
		name : "Arto Hellas",
		number: "040-123456"
	},
	{
		id: 2,
		name: "Ada Lovelace",
		number: "39-44-5323523"
	},
	{
		id: 3,
		name: "Dan Abramov",
		number: "12-43-234345"
	},
	{
		id: 4,
		name: "Mary Poppendick",
		number: "39-23-6423122"
	}
]

app.get('/info', (req, res) => {
	const count = persons.length
	const date_ob = new Date();
	const message = `<p>Phonebook has info for ${count} people</p><p>${date_ob}</p>`
	res.send(message)
})

app.get('/api/persons', (req, res) => {
	res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(persons => persons.id === id)
	
	if (person) {
		response.json(person)
	} else {
		response.status(404).end()
	}
})

const generateId = () => {
	return Math.round(Math.random() * 2147483646)
}

app.post('/api/persons', (request, response) => {
	const body = request.body

	if (!body.name && !body.number) {
		return response.status(400).json({ 
		error: 'name and/or number missing' 
		})
	}

	const foundPerson = persons.find(person => person.name === body.name)
	if (foundPerson) {
		return response.status(400).json({
			error: 'name must be unique'
		})
	}

	const person = {
		name: body.name,
		number: body.number,
		id: generateId(),
	}

	persons = persons.concat(person)

	response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter(person => person.id !== id)

	response.status(204).end()
})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
	app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})