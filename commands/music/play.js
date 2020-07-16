const { Command } = require('discord.js-commando')
const ytdl = require('ytdl-core')

module.exports = module.exports = class PlayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'play',
			group: 'music',
			memberName: 'play',
            description: 'Play a song',
            args: [
                {
                    key: 'query',
                    prompt: 'What song or playlist would you like to listen to?',
                    type: 'string',
                    validate: function(query){
                        return query.length > 0 && query.length < 200
                    }
                }
            ]
		});
	}

	run(message, {query}) {
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            return message.say("Você precisa estar em canal de voz")
        }
        voiceChannel.join().then((connection) => {
            connection.play(ytdl(query, {quality: 'highestaudio'}))
        })
	}
};