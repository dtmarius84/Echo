const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hi')
		.setDescription('<3'),
	async execute(interaction) {
		return interaction.reply('(´・ω・)っ❤️ hi');
	},
};