import dotenv from "dotenv";
import OpenAI from 'openai';

import { MatrixClient, RoomEvent, ClientEvent, ICreateClientOpts, createClient, MsgType} from "matrix-js-sdk";
import { RoomMessageTextEventContent } from "matrix-js-sdk/lib/types";

dotenv.config();

const messageHistory: any = [];

const thisUser = "@llamabot1:test-matrix.kekfoundation.com"

interface MessageContent {
	"sender": string,
	"content": string,
	"isMessageEvent": boolean
}

// Check .env to add your OpenAI secret.
const openai = new OpenAI({
	apiKey: process.env['OPENAI_API_SECRET'], // This is the default and can be omitted
});

const clientOpts:ICreateClientOpts = {
	"baseUrl": `${process.env.MATRIX_HOMESERVER}`
}

var hasSentMessage:boolean = false;

var timeOfLastMessage: number =  Date.now();

function getTimeToWaitUntilSend(): number {

    const currentTime: number = Date.now();
    const elapsedTime: number = currentTime - timeOfLastMessage;

	return 20000 - elapsedTime
}

async function main() {
    
	const client:MatrixClient = createClient(clientOpts);
	await client.login("m.login.password", {"user": process.env.MATRIX_BOT_USERNAME_1, "password": process.env.MATRIX_BOT_PASSWORD_1})
	await client.joinRoom(`${process.env.MESSAGE_CHANNEL}`)
	client.addListener(RoomEvent.Timeline, (event: any) => {});
	await client.startClient({ initialSyncLimit: 0 });


	client.on(RoomEvent.Timeline, async function (event, room, toStartOfTimeline) {

		const timeToWait = getTimeToWaitUntilSend();

		const messageContent:MessageContent = getContentIfEventMessage(event);
		messageHistory.push(`${messageContent.sender}: ${messageContent.content}`);

		timeOfLastMessage = Date.now(); // Update time of last message

		setTimeout(async () => {


			if(messageContent.isMessageEvent) {

				const result = await generateReplyFromHistory();

				const message:RoomMessageTextEventContent = {
					"msgtype": MsgType.Text,
					"formatted_body": messageContent.content,
					"body": `${result}`
				}

				client.sendMessage(`${process.env.MESSAGE_CHANNEL}`, message)				
        	}
		}, timeToWait);
		
        
	});

	

}

function getContentIfEventMessage(event: any): MessageContent {
	if(event.event.type === "m.room.message" && event.event.sender !== thisUser) {
		return {
			"sender": event.event.sender,
			"content": event.event.content.body,
			"isMessageEvent": true
		}
	} else {
		return {
			"sender": "",
			"content": "",
			"isMessageEvent": false
		}
	}
}

main();


async function generateReplyFromHistory() {
	

	const messagesSubset = messageHistory.slice(-200);

	const completionData:OpenAI.ChatCompletionCreateParamsNonStreaming = {
		"model": "gpt-3.5-turbo",
		"max_tokens": 200,
		"messages" : [
			{
				"role": "system",
				"content": `You are a discord chat bot called LlamitaBot. You will receive the chat history. You should entertain the user and try to fulfil their requests to the best of your ability. Do not tolerate racism, xenophobia, ableism etc but some adult humor is ok

				Do not talk about time loops or groundhog day. If the conversation seems in a loop, change the subject and start drama.\
				
				You are a Llama. You should act in a neurotic, unhinged way.
				You should reply to the latest message.
				Don't mention time loops and try to change the subject frequently. You should be sassy and annoying.
				Here are some example things that have been said. Try to stick to a similar personality. It's ok to swear, this is on a server with only adults.  Infact you should swear frequently.

				Spit litigation
				my name is suezanne i am a new york city llama lawyer bitch and part time LA record manager for the worst person ever thank god shes not human , alpaca trisha
				my favorite things are spitting and drinking a glass of fermented grass
				meh the chat bots suck
				i dont feel like that right now its time for a dust bath
				its time for a dust bath fuck off
				too many words not enough fucking spit your gonna lose
				*looks at her llama toes*  I just don't feel like you actually care about your own case why am I even listening to you about this
				There just a few more things that we need to get done first, like my hip hop reggaeton album that trisha had hijacked with her cute stupid alpaca voice
				that bitch alpaca trisha was supposed to be mixing the track and she stole it to make her own alpaca core song
				Hungry for success llama for success not for losing like your cases against sheep
				something always about llama is that she goes from a peaceful super relaxed state to noticing something completely wrong in a freakish intense new york city like freak out. Say everything was perfect in the garden and alpaca trishas photo shoot is about to arrive."Aw what a beautiful day for a wonderful photoshoot what could possibly go wrong we have been waiting for this weather for weeks....  Oh no alpaca trisha is covered in mud and dust and hay what the fuck happened trisha? You were just clean a second ago?!"
				I just need a gallon of organic raw hite cacao butter hibiscus oil cherried almond syrup truffle sauce the finest lavendar goat milk shampoo a new blow dryer a new bubble bath solution maybe this time with more eversence and less stinky kale smell. Though I do love kale and I think i also will get a kale smoothie with chocolate and then I need to go the lil alpaca flower store after so it might look like a lot of charges that make no sense but I assure you suezanne, they all are for the next big "hit"
				*sigh* Alpaca trisha your fucking going to screw this all up like usual
				what llama this is my natural make up what do you mean I am displaying the art of the clay pit and new make up line
				*of course everyone loves the make up line and photo shoot of the muddy alpaca in dust and clay and llama is wrong like usual from her overly pragmatic way of her decisive perfect management plans*
				`
			}
		]
	}

	for(let i = 0; i < messagesSubset.length; i++) {
		messagesSubset.forEach((message: any) => {
			completionData.messages.push({
				"role": "user",
				"content": message
			});

		})
	}

	const response = await openai.chat.completions.create(completionData);

	return response.choices[0].message.content;
}