const { SlashCommandBuilder, EmbedBuilder, italic } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription("sends a list with the bot's commands"),

async execute(interaction) {
    const bot = interaction.client.user;
    const embed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle('Echo')
        .setThumbnail(bot.avatarURL())
        .setDescription( italic('a silly talkative bot that learns from your messages (ping it)') )
        .addFields(
            { name: ' ', value: ' ' },
            { name: 'Member Commands', value: `**/hi** - replies with a salute \n**/yay** - a moment for celebration`},
            { name: ' ', value: ' ' },
            { name: 'Admin Commands', value: `**/ping** - spam an user with pings (extremely funny) \n
                **/redirect** - this commands will redirect the bot to a certain channel, whenever a message is sent in said channel it will reply \n
                **/unredirect** - wipes up the /redirect channel`},
        )
        .setFooter({ text: `Thank you for using this bot :)` });

	return interaction.reply({ embeds: [embed] });
	},
};
