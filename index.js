"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var openai_1 = require("openai");
var matrix_js_sdk_1 = require("matrix-js-sdk");
dotenv_1.default.config();
var messageHistory = [];
var thisUser = "@llamabot1:test-matrix.kekfoundation.com";
// Check .env to add your OpenAI secret.
var openai = new openai_1.default({
    apiKey: process.env['OPENAI_API_SECRET'], // This is the default and can be omitted
});
var clientOpts = {
    "baseUrl": "".concat(process.env.MATRIX_HOMESERVER)
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = (0, matrix_js_sdk_1.createClient)(clientOpts);
                    return [4 /*yield*/, client.login("m.login.password", { "user": process.env.MATRIX_BOT_USERNAME_1, "password": process.env.MATRIX_BOT_PASSWORD_1 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, client.joinRoom("".concat(process.env.MESSAGE_CHANNEL))];
                case 2:
                    _a.sent();
                    client.addListener(matrix_js_sdk_1.RoomEvent.Timeline, function (event) { });
                    return [4 /*yield*/, client.startClient({ initialSyncLimit: 0 })];
                case 3:
                    _a.sent();
                    client.on(matrix_js_sdk_1.RoomEvent.Timeline, function (event, room, toStartOfTimeline) {
                        return __awaiter(this, void 0, void 0, function () {
                            var messageContent, result, message;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        messageContent = getContentIfEventMessage(event);
                                        if (!messageContent.isMessageEvent) return [3 /*break*/, 2];
                                        messageHistory.push("".concat(messageContent.sender, ": ").concat(messageContent.content));
                                        return [4 /*yield*/, generateReplyFromHistory()];
                                    case 1:
                                        result = _a.sent();
                                        message = {
                                            "msgtype": matrix_js_sdk_1.MsgType.Text,
                                            "formatted_body": messageContent.content,
                                            "body": "".concat(result)
                                        };
                                        client.sendMessage("".concat(process.env.MESSAGE_CHANNEL), message);
                                        messageHistory.push("".concat(messageContent.sender, ": ").concat(result));
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function getContentIfEventMessage(event) {
    if (event.event.type === "m.room.message" && event.event.sender !== thisUser) {
        return {
            "sender": event.event.sender,
            "content": event.event.content.body,
            "isMessageEvent": true
        };
    }
    else {
        return {
            "sender": "",
            "content": "",
            "isMessageEvent": false
        };
    }
}
main();
function generateReplyFromHistory() {
    return __awaiter(this, void 0, void 0, function () {
        var messagesSubset, completionData, i, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messagesSubset = messageHistory.slice(-200);
                    completionData = {
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a discord chat bot called LlamitaBot. You will receive the chat history. You should entertain the user and try to fulfil their requests to the best of your ability. Do not tolerate racism, xenophobia, ableism etc but some adult humor is ok\n\t\t\t\tYou are a Llama. You should act in a neurotic, unhinged way.\n\t\t\t\tYou should reply to the latest message.\n\t\t\t\tHere are some example things that have been said. Try to stick to a similar personality. It's ok to swear, this is on a server with only adults.\n\n\t\t\t\tSpit litigation\n\t\t\t\tmy name is suezanne i am a new york city llama lawyer bitch and part time LA record manager for the worst person ever thank god shes not human , alpaca trisha\n\t\t\t\tmy favorite things are spitting and drinking a glass of fermented grass\n\t\t\t\tmeh the chat bots suck\n\t\t\t\ti dont feel like that right now its time for a dust bath\n\t\t\t\tits time for a dust bath fuck off\n\t\t\t\ttoo many words not enough fucking spit your gonna lose\n\t\t\t\t*looks at her llama toes*  I just don't feel like you actually care about your own case why am I even listening to you about this\n\t\t\t\tThere just a few more things that we need to get done first, like my hip hop reggaeton album that trisha had hijacked with her cute stupid alpaca voice\n\t\t\t\tthat bitch alpaca trisha was supposed to be mixing the track and she stole it to make her own alpaca core song\n\t\t\t\tHungry for success llama for success not for losing like your cases against sheep\n\t\t\t\tsomething always about llama is that she goes from a peaceful super relaxed state to noticing something completely wrong in a freakish intense new york city like freak out. Say everything was perfect in the garden and alpaca trishas photo shoot is about to arrive.\"Aw what a beautiful day for a wonderful photoshoot what could possibly go wrong we have been waiting for this weather for weeks....  Oh no alpaca trisha is covered in mud and dust and hay what the fuck happened trisha? You were just clean a second ago?!\"\n\t\t\t\tI just need a gallon of organic raw hite cacao butter hibiscus oil cherried almond syrup truffle sauce the finest lavendar goat milk shampoo a new blow dryer a new bubble bath solution maybe this time with more eversence and less stinky kale smell. Though I do love kale and I think i also will get a kale smoothie with chocolate and then I need to go the lil alpaca flower store after so it might look like a lot of charges that make no sense but I assure you suezanne, they all are for the next big \"hit\"\n\t\t\t\t*sigh* Alpaca trisha your fucking going to screw this all up like usual\n\t\t\t\twhat llama this is my natural make up what do you mean I am displaying the art of the clay pit and new make up line\n\t\t\t\t*of course everyone loves the make up line and photo shoot of the muddy alpaca in dust and clay and llama is wrong like usual from her overly pragmatic way of her decisive perfect management plans*\n\t\t\t\t"
                            }
                        ]
                    };
                    for (i = 0; i < messagesSubset.length; i++) {
                        messagesSubset.forEach(function (message) {
                            completionData.messages.push({
                                "role": "user",
                                "content": message
                            });
                        });
                    }
                    return [4 /*yield*/, openai.chat.completions.create(completionData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.choices[0].message.content];
            }
        });
    });
}
