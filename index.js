require('dotenv').config();
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");
const {encode, decode} = require('gpt-3-encoder')

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.text());

const configuration = new Configuration({
	apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);


let sessions = {};

app.post('/chat/', async (req, res) => {

	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{"role": "system", "content": "You are a helpful assistant."},
			{"role": "user", "content": req.body},
		]
	});

	const completion_text = completion.data.choices[0].message.content;
	res.send(completion_text);
});

app.get('/chat/clear/:session/', (req, res) => {
	delete sessions[req.params.session];
	res.send("✔️");
});

app.post('/chat/:session/', async (req, res) => {

	let messages = [{"role": "system", "content": "You are a helpful assistant."}];
	
	if(req.params.session in sessions) {
		console.log(sessions[req.params.session]);
		messages.push(...sessions[req.params.session]);
	} else {
		sessions[req.params.session] = [];
	}

	messages.push({"role": "user", "content": req.body});

	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: messages
	});
	const completion_text = completion.data.choices[0].message.content;

	while(encode(sessions[req.params.session].map(obj => obj.content).join(' ')).length > 4000) {
		sessions[req.params.session].shift();
	}

	sessions[req.params.session].push({"role": "user", "content": req.body});
	sessions[req.params.session].push({"role": "assistant", "content": completion_text});

	res.send(completion_text);
});

// Start the server
app.listen(3600, () => {
	console.log('Server listening on port 3600!');
});