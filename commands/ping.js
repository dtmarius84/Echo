const {SlashCommandBuilder, userMention} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('the best way to piss someone off!')
		.addUserOption(option => option.setName('user').setDescription('the member to ping').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('how many mentions').setRequired(true))
        .setDefaultMemberPermissions(0x8),

        async execute(interaction) {
            const member = interaction.options.getMember('user');
            const amount = interaction.options.getInteger('amount');
            if (member==null)
                return interaction.reply({ content: 'you need to input a user!', ephemeral: true });
            if (amount < 1) {
                return interaction.reply({ content: 'you need to input a valid user and a valid number of mentions!', ephemeral: true });
            }
            if (amount > 10)
                return interaction.reply({ content: 'the maximum ammount of mentions is 10!', ephemeral: true});
            interaction.reply({content: `(´・ω・)っ❤️ sending love to ${member} ${amount} times`, ephemeral: true})
            for (let i=1; i<=amount; i++)
                interaction.channel.send(`<@${member.user.id}>`);
            console.log(`"${interaction.user.tag}" pinged "${member.user.tag}" ${amount} times`);
        },
};