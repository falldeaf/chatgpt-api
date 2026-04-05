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

const models = ["gpt-3.5-turbo", "gpt-4"];
let current_model = 0;
let current_temp = 0.7;

let sessions = {};
let sessions_settings = {};

let can_search = true;
let can_execute = true;

app.post('/prompt/:temp/:session', async (req, res) => {
	//convert :temp to a number
	req.params.temp = Number(req.params.temp);
	//if :temp is between or equal to 0 and 1 then set current_temp to it
	if(req.params.temp >= 0 && req.params.temp <= 1) {
		//set the session's temp to the new temp
		sessions_settings[req.params.session].temp = req.params.temp;
	}
	res.send("✔️");
});

app.get('/chat/settings/:session', (req, res) => {
	//if session settings exists then send it, otherwise send a message saying it doesn't exist
	if(req.params.session in sessions_settings) {
		res.send(sessions_settings[req.params.session]);
	} else {
		res.send("Settings for this session don't exist.");
	}
});

app.get('/chat/clear/:session/', (req, res) => {
	delete sessions[req.params.session];
	delete sessions_settings[req.params.session];
	res.send("✔️");
});

app.get('/chat/:model/:session', async (req, res) => {
	req.params.model = Number(req.params.model);
	//if :model is a valid index of models then set current_model to it
	if(req.params.model in models) {
		//set the session's model to the new model
		sessions_settings[req.params.session].model = req.params.model;
	}
});


app.post('/chat/:session/', async (req, res) => {
	//if session settings doesn't exist then create it
	if(!(req.params.session in sessions_settings)) {
		sessions_settings[req.params.session] = {};
	}

	let messages = [{"role": "system", "content": "You are a helpful assistant."}];

	if(req.params.session in sessions) {
		console.log(sessions[req.params.session]);
		messages.push(...sessions[req.params.session]);
	} else {
		sessions[req.params.session] = [];
	}

	messages.push({"role": "user", "content": req.body});

	//check if session has a model property
	if(!("model" in sessions_settings[req.params.session])) {
		//if not then set it to 0
		sessions_settings[req.params.session].model = 0;
	}

	//check if session has a temp property
	if(!("temp" in sessions_settings[req.params.session])) {
		//if not then set it to 0.7
		sessions_settings[req.params.session].temp = 0.7;
	}

	const completion = await openai.createChatCompletion({
		model: models[sessions_settings[req.params.session].model],
		temperature: sessions_settings[req.params.session].temp,
		messages: messages
	});
	const completion_text = completion.data.choices[0].message.content;

	while(encode(sessions[req.params.session].map(obj => obj.content).join(' ')).length > 4000) {
		sessions[req.params.session].shift();
	}

	sessions[req.params.session].push({"role": "user", "content": req.body});
	sessions[req.params.session].push({"role": "assistant", "content": completion_text});

	console.log(req.params.session)

	res.send(completion_text);
});

// Start the server
app.listen(3600, () => {
	console.log('Server listening on port 3600!');
});