//rework her commands (they are in ai-bot)

const fs = require('node:fs');
const {promises: fsPromises} = require('fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config({path: path.join(__dirname, '.env')});
const token = process.env.TOKEN;

const client = new Client
        ({ intents:
          [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildPresences,
          ]
        });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async () => {
  console.log('echo is online');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'there was an error while executing this command', ephemeral: true });
	}
});

const { MongoClient } = require('mongodb');
const url = process.env.DB_PASSWORD;
const dbclient = new MongoClient(url);
const db = dbclient.db('echo');
dbclient.connect();
const dbmessages = db.collection('msgs');

async function createMessage(msg, response, length) {
  try {
    for (let i = 1; i <= length; i++) {
      const test = await dbmessages.findOne({ _id: msg });
      if (!test || !test.nextWords) {
        console.log(`no word pair data for '${msg}'`);
        break;
      }

      const total = Object.values(test.nextWords).reduce((sum, value) => sum + value, 0);
      const percentages = {};
      if (total === 0) {
        for (const key in test.nextWords) {
          percentages[key] = 0.0;
        }
      } else {
        for (const key in test.nextWords) {
          percentages[key] = (test.nextWords / total) * 100;
        }
      }

      const rand = Math.random() * 100;
      let cumulative = 0;
      let nextWord = null;
      for (const key in percentages) {
        cumulative += percentages[key];
        if (rand <= cumulative) {
          nextWord = key;
          break;
        }
      }
      if (!nextWord) {
        const keys = Object.keys(test.nextWords);
        nextWord = keys[Math.floor(Math.random() * keys.length)];
      }

      response += " " + nextWord;
      msg = nextWord;
    }
    return response.trim();
  } catch (error) {
    console.error("error in creating message:", error);
    return response.trim();
  }
}


let channelid = [];
async function updateChannelValuesArray() {
	try {
		await dbclient.connect();
		const dbchannels = db.collection('channelid');
		const channelData = await dbchannels.find({}, { projection: { channel: true, _id: false } }).toArray();
		channelid = channelData.map(item => item.channel); 
		} catch (err) {
			console.error(err);
		}
}
module.exports = { updateChannelValuesArray, channelid };
updateChannelValuesArray();


client.on("messageCreate", async (message) => {
  const server = message.guildId;

  if (message.author.bot || message.mentions.users.some(user => user.bot && user.id !== '1047958588909428737')) 
    return;

  try {
    let precedent = null;
    let d = 0;
    const words = message.content.split(/\s+/).filter(word => word.length > 0);
    const sentence = words.filter(word => !word.match(/<@!?1047958588909428737>/));

    for (const word of sentence) {
      if (d === 0) {
        precedent = word;
        d = 1;
      } else {
        await dbmessages.updateOne(
          { _id: precedent },
          { $inc: { [`nextWords.${word}`]: 1 } },
          { upsert: true }
        );
        console.log(`updated word pair: ${precedent}.${word}`);
        precedent = word;
      }
    }

    if (message.mentions.has('1047958588909428737') || channelid.includes(message.channel.id)) {
      if (sentence.length === 0) 
        return;

      let msg = sentence[Math.floor(Math.random() * sentence.length)];
      let test = await dbmessages.findOne({[`wordPairs.${msg}`]: { $exists: true } });
      let attempts = 0;

      while (!test && attempts < sentence.length) {
        if (sentence.length === 0) {
          console.log("no valid starting word found");
          return;
        }
        msg = sentence[Math.floor(Math.random() * sentence.length)];
        test = await dbmessages.findOne({ _id: msg });
        attempts++;
      }

      console.log(`start message: ${msg}`);

      if (test) {
        const minl = sentence.length * 0.25;
        const maxl = sentence.length + minl;
        const length = Math.floor(Math.random() * (maxl - minl + 1)) + minl; //this formula is probably incorrect
        const response = await createMessage(msg, msg, length);
        await message.channel.send(response);
        console.log(`sent message: "${response}" serverID:${server}`);
      }
    }
  } catch (error) {
    console.error("error in creating message:", error);
  }
});

client.login(token);
