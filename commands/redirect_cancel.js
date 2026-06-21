const {SlashCommandBuilder} = require('discord.js');
const { MongoClient } = require('mongodb');
const path = require('node:path');
require('dotenv').config({path: path.join(__dirname, '.env')});
const url = process.env.DB_PASSWORD;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unredirect')
        .setDescription('unredirect the bot from any channel')
        .setDefaultMemberPermissions(0x8),

async execute(interaction) {
        const server = interaction.guild;
        try {

            const client = new MongoClient(url);
            await client.connect();
            const db = client.db('echo');
            const channels = db.collection('channelid');
            const { updateChannelValuesArray } = require('../index');
            const channelDocument = await channels.findOne({ "serverid": server.id });

            if (channelDocument) {
                  await channels.deleteOne({
                      serverid: server.id,
                  });
              } 
            updateChannelValuesArray();

            interaction.reply({
                content: `You have unredirected the bot`,
                ephemeral: true,
              });

            console.log(`"${interaction.user.tag}" unredirected echo`);
            } catch (error) {
              console.error('Error:', error);
            }
        },
};
