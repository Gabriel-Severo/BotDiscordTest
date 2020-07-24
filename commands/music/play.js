require('dotenv')
const { Command } = require('discord.js-commando')
const Youtube = require('simple-youtube-api')
const youtube = new Youtube(process.env.YOUTUBE_API)
const ytdl = require('ytdl-core')
const { MessageEmbed } = require('discord.js')

module.exports = class PlayCommand extends Command {
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

	async run(message, {query}) {
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            return message.say("Você precisa estar em canal de voz")
        }
        if(query.match('^(?!.*\?v=)https:\/\/www\.youtube\.com\/.*\?list=.*$')){
            console.log("Playlist")
        }else if(query.match('^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+')){
            console.log("Video normal")
            voiceChannel.join().then((connection) => {
                connection.play(ytdl(query, {quality: 'highestaudio'}))
                .on('start', () => {
                    message.say("Começou tocar")
                })
                .on('finish', () => {
                    message.say('Terminou de tocar')
                })
            })
        }else{
            const videos = await youtube.search(query, 5).catch(async () =>{
                return message.say("Erro ao procurar")
            })
            
            const embed = new MessageEmbed()
                .setColor('#e9f931')
                .setTitle("Videos")
                .addField('Música 1', videos[0].title)
                .addField('Música 2', videos[1].title)
                .addField('Música 3', videos[2].title)
                .addField('Música 4', videos[3].title)
                .addField('Música 5', videos[4].title)
                .addField('Cancel', 'cancelar')
            let songEmbed = await message.channel.send({embed})

            message.channel.awaitMessages((msg) => {
                return (msg.content > 0 && msg.content < 6) || msg.content === 'exit'
            }, 
            {
                max: 1,
                time: 60000,
                error: ['time']
            }).then(async (response) => {
                if(response.first().content === 'cancel') return songEmbed.delete()
                const videoID = parseInt(response.first().content)

                voiceChannel.join().then((connection) => {
                    connection.play(ytdl(`https://www.youtube.com/watch?v=${videos[videoID - 1].id}`, {quality: 'highestaudio'}))
                    .on('start', () => {
                        message.say("Começou tocar")
                    })
                    .on('finish', () => {
                        message.say('Terminou de tocar')
                    })
                })
            }).catch((err) => {console.log(err)})
            
        }
	}
};