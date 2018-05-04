const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').load()
const stripe = require('stripe')(process.env.STRIPE_KEY)

let loggingMiddleware = (req, res, next) => {
	console.log("Request received")
	next()
}

const app = express()
app.use(bodyParser.json())
app.use(loggingMiddleware)


app.post('/api/stripe', (req, res) => {

	if(!req.body.token) {
		console.error("Error, no token provided")
		return res.status(401).send({err: "Error, no se proporciono token de pago"})
	}

	if(!req.body.amount) {
		console.error("Error, no amount specified")
		return res.status(401).send({err: "Error, no se proporciono el numero de paquetes"})
	}

	if(!req.body.description) {
		console.error("Error, no description specified")
		return res.status(401).send({err: "Error, no se proporciono la descripcion de cobro"})
	}


	let amount = req.body.amount * 25 * 100;
	const token = req.body.token

	const charge = stripe.charges.create({
		amount: amount,
		currency: 'mxn',
		description: req.body.description,
		source: token,
		statement_descriptor: "Compra en APP movil"
	})


	charge.then(
		function success(){
			console.log("Success making charge")
			res.status(200).send({charge: charge})
		},
		function error(){
			console.log("Error making charge")
			res.status(500).send({err: "Error realizando transaccion"})
		})


})

app.listen(8001, (err) => {
	if(err) console.error(err)
	console.log("Server ready, listening at", 8001)
})
