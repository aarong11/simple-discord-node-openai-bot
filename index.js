const { Client, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv').config();
const OpenAI = require('openai');

// Check .env to add your OpenAI secret.
const openai = new OpenAI({
	apiKey: process.env['OPENAI_API_SECRET'], // This is the default and can be omitted
});

// Check .env to add your Discord bot secret
const token = process.env.DISCORD_BOT_SECRET;

const messageHistory = [];

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	]
});

client.on("messageCreate", (message) => {
	if(!message.author.bot) {
		messageHistory.push(`@${message.author.globalName}: ${message.content}`)

		generateReplyFromHistory().then((result) => {
			message.channel.send(result);
		})
	}
});


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});	

// Log in to Discord with your client's token
client.login(token);

async function generateReplyFromHistory() {
	const args = {
		"messages": [
			{
				"role": "system",
				"content": `You are a discord chat bot on a server with multiple people. You will receive the chat history. You should entertain the user and try to fulfil their requests to the best of your ability. Do not tolerate racism, xenophobia, ableism etc.`
			}
		]
	}

	const messagesSubset = messageHistory.slice(-200);


	messagesSubset.forEach((message) => {
		args.messages.push({
			"role": "user",
			"content": message
		})
	})

	const response = await openai.chat.completions.create({
		messages: args.messages,
		model: 'gpt-3.5-turbo'
	});

	return response.choices[0].message.content;
}