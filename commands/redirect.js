const { SlashCommandBuilder, ChannelType} = require('discord.js');
const { MongoClient } = require('mongodb');
const path = require('node:path');
require('dotenv').config({path: path.join(__dirname, '.env')});
const url = process.env.DB_PASSWORD;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('redirect')
		.setDescription('direct the bot to a channel where it will talk')
    .addChannelOption(option => option.setName('channel').setDescription('select a channel').setRequired(true))
    .setDefaultMemberPermissions(0x8),
    
	async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const server = interaction.guild;
        try {

          const client = new MongoClient(url);
          await client.connect();
          const db = client.db('shiina');
          const channels = db.collection('channelid');
          const { updateChannelValuesArray } = require('../index');

          if (channel.type === ChannelType.GuildText) {
            const channelDocument = await channels.findOne({ "serverid": server.id });
            if (!channelDocument) {
              await channels.insertOne({
                  "channel": channel.id,
                  "serverid": server.id,
              });

          } else {
              await channels.updateOne(
                  { "serverid": server.id },
                  { $set: { "channel": channel.id } }
              );
          }
          updateChannelValuesArray();

          interaction.reply({
            content: `You have redirected the bot to channel ${channel}`,
            ephemeral: true,
          });

          } else {
            return interaction.reply({ content: 'You need to input a valid text channel', ephemeral: true });
          }
    
        console.log(`"${interaction.user.tag}" redirected shiina to "${channel.id} : ${channel.name}"`);
        } catch (error) {
          console.error('Error:', error);
        } 
      },
    };