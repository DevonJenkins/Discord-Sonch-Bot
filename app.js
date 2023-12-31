import 'dotenv/config';
import express from 'express';
import exec from 'node:child_process'
import { REST, Client, GatewayIntentBits, } from 'discord.js';
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';

//console.log(exec.exec("echo hello"))

const client = new Client ({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
	]
}) 




//----------------imports
//
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';

import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import {channel} from 'node:diagnostics_channel';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */

app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
			const userId = req.body.member.user
			const channel = req.body.channel

			//console.log("user:")
			//console.log(userId.global_name)
			//console.log("channel: ")
			//console.log(channel)

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
					content: 'hello', tts: true
        },
      });
    }


		//if(name === "join"){
		//	console.log("test")
		//	//const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
		//	//const voiceChannel = interaction.options.getChannel('channel')
		//	//console.log(voiceChannel)
		//	//const connection = joinVoiceChannel({
		//		//	///how do i get the info needed below
		//		//	channelId: channel.id,
		//		//	guildId: channel.guild_id,
		//		//	adapterCreator: channel.message.guild.voiceAdapterCreater,
		//		//	//
		//		//})

		//	return res.send({
		//		type: InteractionType.APPLICATION_COMMAND,
		//		data: {
		//			content: [

		//			]

		//		},
		//	});

		//	//await DiscordRequest(endpoint, { method: 'DELETE' });
		//}
		//

		if (name === 'join') {
			//const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message}`;

			//console.log(endpoint)

			//console.log("evoking join command")
			//console.log(req.body.channel)
			//console.log(VoiceConnection)
			//VoiceConnection
			//console.log(joinVoiceChannel.toString())

			//const connection = joinVoiceChannel({
				//channelId: req.body.channel.id,
				//guildId:req.body.channel.guild_id, 
				//adapterCreator: channel.guild.voiceAdapterCreator 
			//})
			console.log('join')

			return res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: `This is a test`,
					components: [
						{
							type: MessageComponentTypes.ACTION_ROW,
							components: [
								{
									type: MessageComponentTypes.BUTTON,
									custom_id: `banana_button_${req.body.id}`,
									label: 'Banana',
									style: ButtonStyleTypes.PRIMARY,
								},
							],
						},
					],
				},
			})
		}

		if (type === InteractionType.MESSAGE_COMPONENT) {
			// custom_id set in payload when sending message component
			console.log("interaction test")
			//const componentId = data.custom_id;

			//if (componentId.startsWith('banana_button_')) {
			//	// get the associated game ID
			//	console.log('banana button')
			//	const gameId = componentId.replace('banana_button_', '');
			//	// Delete message with token in request body
			//	const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

			//	try {
			//		await res.send({
			//			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			//			data: {
			//				// Fetches a random emoji to send from a helper function
			//				content: 'What is your banana of choice?',
			//				// Indicates it'll be an ephemeral message
			//			},
			//		});
			//		// Delete previous message
			//		await DiscordRequest(endpoint, { method: 'DELETE' });
			//	} catch (err) {
			//		console.error('Error sending message:', err);
			//	}
			//}
		}



    if (name === 'sync') {
      // Send a message into the channel where command was triggered from
			//NOTE it would be cool to add a vote system to make sure that everyone is
			//ready
			//
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
					content: 'commence sonch! in three [[slnc 1000]] two [[slnc 1000]] one [[slnc 1000]] ' + getRandomEmoji(), tts: true,
        },
      });
    }

		// "challenge" command
		if (name === 'challenge' && id) {
			const userId = req.body.member.user.id;
			// User's object choice
			const objectName = req.body.data.options[0].value;

			// Create active game using message ID as the game ID
			activeGames[id] = {
				id: userId,
				objectName,
			};

			return res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					// Fetches a random emoji to send from a helper function
					content: `Rock papers scissors challenge from <@${userId}>`,
					components: [
						{
							type: MessageComponentTypes.ACTION_ROW,
							components: [
								{
									type: MessageComponentTypes.BUTTON,
									// Append the game ID to use later on
									custom_id: `accept_button_${req.body.id}`,
									label: 'Accept',
									style: ButtonStyleTypes.PRIMARY,
								},
							],
						},
					],
				},
			});
		}

		if (type === InteractionType.MESSAGE_COMPONENT) {
			// custom_id set in payload when sending message component
			const componentId = data.custom_id;

			if (componentId.startsWith('accept_button_')) {
				// get the associated game ID
				const gameId = componentId.replace('accept_button_', '');
				// Delete message with token in request body
				const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
				try {
					await res.send({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							// Fetches a random emoji to send from a helper function
							content: 'What is your object of choice?',
							// Indicates it'll be an ephemeral message
							flags: InteractionResponseFlags.EPHEMERAL,
							components: [
								{
									type: MessageComponentTypes.ACTION_ROW,
									components: [
										{
											type: MessageComponentTypes.STRING_SELECT,
											// Append game ID
											custom_id: `select_choice_${gameId}`,
											options: getShuffledOptions(),
										},
									],
								},
							],
						},
					});
					// Delete previous message
					await DiscordRequest(endpoint, { method: 'DELETE' });
				} catch (err) {
					console.error('Error sending message:', err);
				}
			}
		}

		if (type === InteractionType.MESSAGE_COMPONENT) {
			// custom_id set in payload when sending message component
			console.log('test')
			const componentId = data.custom_id;

			if (componentId.startsWith('accept_button_')) {
				// get the associated game ID
				const gameId = componentId.replace('accept_button_', '');
				// Delete message with token in request body
				const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
				try {
					await res.send({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							// Fetches a random emoji to send from a helper function
							content: 'What is your object of choice?',
							// Indicates it'll be an ephemeral message
							flags: InteractionResponseFlags.EPHEMERAL,
							components: [
								{
									type: MessageComponentTypes.ACTION_ROW,
									components: [
										{
											type: MessageComponentTypes.STRING_SELECT,
											// Append game ID
											custom_id: `select_choice_${gameId}`,
											options: getShuffledOptions(),
										},
									],
								},
							],
						},
					});
					// Delete previous message
					await DiscordRequest(endpoint, { method: 'DELETE' });
				} catch (err) {
					console.error('Error sending message:', err);
				}
			} else if (componentId.startsWith('select_choice_')) {
				// get the associated game ID
				const gameId = componentId.replace('select_choice_', '');

				if (activeGames[gameId]) {
					// Get user ID and object choice for responding user
					const userId = req.body.member.user.id;
					const objectName = data.values[0];
					// Calculate result from helper function
					const resultStr = getResult(activeGames[gameId], {
						id: userId,
						objectName,
					});

					// Remove game from storage
					delete activeGames[gameId];
					// Update message with token in request body
					const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

					try {
						// Send results
						await res.send({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: { content: resultStr },
						});
						// Update ephemeral message
						await DiscordRequest(endpoint, {
							method: 'PATCH',
							body: {
								content: 'Nice choice ' + getRandomEmoji(),
								components: []
							}
						});
					} catch (err) {
						console.error('Error sending message:', err);
					}
				}
			}
		}
	}
});

app.listen(PORT, () => {
	console.log('Listening on port', PORT);
});
