const mongoose = require('mongoose')

if (process.argv.length<3) {
	console.log('give password as argument')
	process.exit(1)
}

const password = process.argv[2]

const url =
	`mongodb+srv://fullstack:${password}@cluster0.czne6.mongodb.net/persons?retryWrites=true`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model('Person', personSchema)

const args = process.argv

if (args.length == 5) {
	const person = new Person({
		name: args[3],
		number: args[4]
	})

	person.save().then(response => {
		console.log(`added ${person.name} number ${person.number} to phonebook`)
		mongoose.connection.close()
	})
} else {
	Person
		.find({})
		.then(persons => {
			console.log("phonebook:")
			persons.forEach(person => {
				console.log(person.name, person.number)
			})
			mongoose.connection.close()
		})
}
