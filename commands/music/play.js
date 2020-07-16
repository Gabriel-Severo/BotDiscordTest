const { Command } = require('discord.js-commando')

module.exports = module.exports = class PlayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'play',
			group: 'music',
			memberName: 'play',
            description: 'Play a song',
		});
	}

	run(message) {
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            return message.say("Você precisa estar em canal de voz")
        }
	}
};