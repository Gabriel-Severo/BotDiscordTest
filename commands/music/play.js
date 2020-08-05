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
            return message.say("Você precisa estar em um canal de voz.")
        }
        if(query.match('^https:\/\/www\.youtube\.com\/.*\?list=.*$')){
            let playlist;
            try{
                playlist = await youtube.getPlaylist(query)
            }catch(e){
                return message.say("Esta playlist não existe ou está privada")
            }

            const videoObj = await playlist.getVideos().catch(() => {
                console.log("Há um problema em obter os vídeos da playlist")
            })
            
            for(let i = 0; i < videoObj.length; i++){
                if(videoObj[i].raw.status.privacyStatus === 'private'){
                    continue
                }else{
                    const video = await videoObj[i].fetch()
                    message.guild.musicData.queue.push(
                        PlayCommand.constructSongObj(video)
                        )
                    }
                }
                
                if(!message.guild.musicData.isPlaying){
                    message.guild.musicData.isPlaying = true
                    PlayCommand.playSong(message.guild.musicData.queue, message)
                    message.say(`Playlist - :musical_note:  ${playlist.title} :musical_note: foi adicionada a fila`)
                }else if(message.guild.musicData.isPlaying){
                    message.say(`Playlist - :musical_note:  ${playlist.title} :musical_note: foi adicionada a fila`)
                }
            }else if(query.match('^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+')){
                youtube.getVideo(query).then(video => {
                message.guild.musicData.queue.push(
                    PlayCommand.constructSongObj(video)
                )
                if(!message.guild.musicData.isPlaying){
                    message.guild.musicData.isPlaying = true
                    PlayCommand.playSong(message.guild.musicData.queue, message)
                }else{
                    message.say(`${video.title} adicionado a fila`)
                }
            })
        }else{
            const videos = await youtube.searchVideos(query, 5).catch(async () =>{
                await message.say("Erro ao procurar")
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

                    songEmbed.delete()
                    youtube.getVideoByID(videos[videoID - 1].id).then((video) => {
                        message.guild.musicData.queue.push(
                            PlayCommand.constructSongObj(video)
                        )
                        if(!message.guild.musicData.isPlaying) {
                            message.guild.musicData.isPlaying = true
                            PlayCommand.playSong(message.guild.musicData.queue, message)
                        }else{
                            message.say(`${video.title} adicionado a fila`)
                        }
                    })

            }).catch((err) => {console.log(err)})
            
        }
    }
    static playSong(queue, message) {
        const voiceChannel = message.member.voice.channel
        voiceChannel.join().then((connection) => {
            const dispatcher = connection.play(ytdl(queue[0].url, {quality: 'highestaudio'}))
            .on('start', () => {
                message.guild.musicData.songDispatcher = dispatcher
                dispatcher.setVolume(message.guild.musicData.volume)
                const videoEmbed = new MessageEmbed()
                    .setThumbnail(queue[0].thumbnail)
                    .setColor('#e9f931')
                    .addField('Tocando agora:', queue[0].title)
                    .addField('Duração:', queue[0].duration)
                message.channel.send(videoEmbed)
                message.guild.musicData.nowPlaying = queue[0]
                return queue.shift()
            })
            .on('finish', () => {
                const guildQueue = message.guild.musicData.queue
                if(message.guild.musicData.looping){
                    guildQueue.unshift(message.guild.musicData.nowPlaying)
                }
                if(guildQueue.length >= 1) {
                    return this.playSong(guildQueue, message)
                }else{
                    message.guild.musicData.isPlaying = false
                    message.guild.musicData.nowPlaying = null
                    message.guild.musicData.songDispatcher = null
                    if(message.guild.me.voice.channel){
                        return message.guild.me.voice.channel.leave()
                    }
                }
            })
            .on('error', (e) => {
                message.say('Cannot play song');
				console.error(e);
				message.guild.musicData.queue.length = 0;
				message.guild.musicData.isPlaying = false;
				message.guild.musicData.nowPlaying = null;
				message.guild.musicData.songDispatcher = null;
				return message.guild.me.voice.channel.leave();
            })
        }).catch(e => {
            console.log(e)
            console.log("Erro 2")
            return message.guild.me.voice.channel.leave()
        })
    }

    static constructSongObj(video){
        let duration = this.formatDuration(video.duration)
        if(duration == '00:00') duration = 'Live Stream'
        return {
            url: `https://www.youtube.com/watch?v=${video.raw.id}`,
            title: video.title,
            rawDuration: video.duration,
            duration,
            thumbnail: video.thumbnails.high.url,
        }
    }

    static formatDuration(durationObj) {
        return `${durationObj.hours ? (durationObj.hours + ':') : ''}${
            durationObj.minutes ? durationObj.minutes : '00'
        }:${
            durationObj.seconds < 10 ? 
            (durationObj.seconds + '0') : 
            durationObj.seconds ?
            durationObj.seconds : '00'
        }`
    }
};