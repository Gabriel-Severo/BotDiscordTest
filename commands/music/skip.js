const { Command } = require('discord.js-commando')

module.exports = class SkipCommand extends Command {
    constructor(client){
        super(client, {
            name: 'skip',
            group: 'music',
            memberName: 'skip',
            description: 'Pula uma música'
        })
    }

    run(message){
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel){
            return message.say("Você precisa estar conectado a um canal de voz")
        }

        if(typeof message.guild.musicData.songDispatcher == 'undefined' ||
            message.guild.musicData.songDispatcher == null){
                return message.say("Não há nenhuma música na fila")
            }
        message.say(`${message.guild.musicData.nowPlaying.title} foi pulada`)
        message.guild.musicData.songDispatcher.end()
        if(message.guild.musicData.looping){
            message.guild.musicData.nowPlaying = null
        }
    }
}