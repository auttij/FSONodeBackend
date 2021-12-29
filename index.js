require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { response } = require('express')
const Person = require('./models/person')

const app = express()

const password = process.argv[2]


app.use(express.static('build'))
app.use(express.json())

morgan.token('body', req => {
	return JSON.stringify(req.body)
})
app.use(morgan('tiny', {
	skip: function (req, res) { return req.method === "POST"}
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
	skip: function (req, res) { return req.method !== "POST"}
}))

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
	Person.find({}).then(persons => {
		res.json(persons)
	})
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

	// const foundPerson = persons.find(person => person.name === body.name)
	// if (foundPerson) {
	// 	return response.status(400).json({
	// 		error: 'name must be unique'
	// 	})
	// }

	const person = new Person({
		name: body.name,
		number: body.number
	})

	person.save().then(savedPerson => {
		response.json(savedPerson)
	})
})

app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body
	
	console.log("id", request.params.id)
	Person.findByIdAndUpdate(request.params.id, {$set: {
		name: body.name,
		number: body.number
	}}, { new: true })
		.then(updatedPerson => {
			console.log("updated person", updatedPerson)
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(result => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
	console.error(error.name)
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})