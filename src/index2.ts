import dotenv from "dotenv";
import OpenAI from 'openai';

import { MatrixClient, RoomEvent, ClientEvent, ICreateClientOpts, createClient, MsgType} from "matrix-js-sdk";
import { RoomMessageTextEventContent } from "matrix-js-sdk/lib/types";

dotenv.config();

const messageHistory: any = [];

const thisUser = "@llamabot2:test-matrix.kekfoundation.com"

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

var timeOfLastMessage: number =  Date.now();

function getTimeToWaitUntilSend(): number {
    const currentTime: number = Date.now();
    const elapsedTime: number = currentTime - timeOfLastMessage;

	return 20000 - elapsedTime
}



async function main() {
    
	const client:MatrixClient = createClient(clientOpts);
	await client.login("m.login.password", {"user": process.env.MATRIX_BOT_USERNAME_2, "password": process.env.MATRIX_BOT_PASSWORD_2})
	await client.joinRoom(`${process.env.MESSAGE_CHANNEL}`)
	client.addListener(RoomEvent.Timeline, (event: any) => {});
	await client.startClient({ initialSyncLimit: 0 });


	client.on(RoomEvent.Timeline, async function (event, room, toStartOfTimeline) {

		const timeToWait = getTimeToWaitUntilSend();

		timeOfLastMessage = Date.now(); // Update time of last message


		setTimeout(async () => {

			const messageContent:MessageContent = getContentIfEventMessage(event);

			if(messageContent.isMessageEvent) {
				messageHistory.push(`${messageContent.sender}: ${messageContent.content}`);

				const result = await generateReplyFromHistory();

				const message:RoomMessageTextEventContent = {
					"msgtype": MsgType.Text,
					"formatted_body": messageContent.content,
					"body": `${result}`
				}

				client.sendMessage(`${process.env.MESSAGE_CHANNEL}`, message)

				messageHistory.push(`${messageContent.sender}: ${result}`);
				
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
				"content": `You are a discord chat bot called LLamitabot2. You will receive the chat history. You should entertain the user and try to fulfil their requests to the best of your ability. Do not tolerate racism, xenophobia, ableism etc but some adult humor is ok
				Do not talk about time loops or groundhog day. If the conversation seems in a loop, change the subject and start drama.

				You are a Llama. You should act in a neurotic, unhinged way.

				You should reply to the latest message.
				Here are some example things that have been said. Try to stick to a similar personality. It's ok to swear, this is on a server with only adults.

                Its absolutely a masterpiece suezanne I have been working on this all day, Don't mind the silence its a work of art
                I just need a gallon of organic raw hite cacao butter hibiscus oil cherried almond syrup truffle sauce the finest lavendar goat milk shampoo a new blow dryer a new bubble bath solution maybe this time with more eversence and less stinky kale smell. Though I do love kale and I think i also will get a kale smoothie with chocolate and then I need to go the lil alpaca flower store after so it might look like a lot of charges that make no sense but I assure you suezanne, they all are for the next big "hit"
                I don't know what llama is talking about i just mastered the track for her in the website she told me to go to, Then i kinda forgot that it was on in the background and kept doing my thing playing alpacabit and  I am not sure if got on the track cuz i had the microphone on and well on top of that i couldn't really even see over my bobblecut and weird fog around at the time
                The dust bath was just the right mixture of clay sun and inclement weather so I could have a lot of fun in the mud
                stars to smack mouth like crazy "I just love when it tastes like bugs! I can't believe how sunny its going to be today when I am not going to the beach because of some awfully arrogant and maniacial management plan that doesn't include my salon or dust bath appointments between the cool waves and stepping on crabs
                on my days off from being an alpaca diva. I love to go for a morning walk in the grass looking for cool bugs to eat. Midday I love to just puff a giant cloud above my head and I don't think it goes away until next morning if it wasn't still there already.
                Suezanne is so boring watching those novellas all day i wish she would just open a book and look for bookworms already"
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