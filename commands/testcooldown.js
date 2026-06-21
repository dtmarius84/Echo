//it will collect the message whenever the cooldown is over
//admins can set it up
//what if no message is sent after the cooldown is over (will an error appear?)

const { SlashCommandBuilder} = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config({path: './dc_bots/shiina/.env'});
const uri = process.env.DB_PASSWORD;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cooldown')
		.setDescription('set the interval in which the bot collects messages')
        .addIntegerOption(option => option.setName('timer').setDescription('in seconds').setRequired(true))
        .setDefaultMemberPermissions(0x8),
    
	async execute(interaction) {
        const timer = interaction.options.getInteger('timer')*1000;
        const server = interaction.guild;

        try {
          const client = new MongoClient(uri); //db
          await client.connect();
          const db = client.db('channels');
          const timers = db.collection('timer');

          const channelDocument = await timers.findOne({ "serverid": server.id });
          if (!channelDocument) {
            await timers.insertOne({
                "serverid": server.id,
                "cooldown": timer,
            });
          } else {
              await timers.updateOne({
                "serverid": server.id ,
                $set: { "cooldown": timer },
              });
          }

        interaction.reply({
            content: `you have set the bot's timer to ${timer/1000} seconds`,
            ephemeral: true,
          });
    
        console.log(`"${interaction.user.tag}" set the timer to ${timer/1000} seconds`);
            } catch (error) {
          console.error('Error:', error);
        } 
      },
    };