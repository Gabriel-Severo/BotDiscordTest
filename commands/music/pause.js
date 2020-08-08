const { Command } = require('discord.js-commando')

module.exports = class PauseCommand extends Command {
    constructor(client){
        super(client, {
            name: 'pause',
            aliases: ['stop'],
            group: 'music',
            memberName: 'pause',
            description: 'Pausa a música'
        })
    }

    run(message) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel){
            return message.say("Você precisa estar em um canal de voz")
        }
        
        if(typeof message.guild.musicData.songDispatcher == 'undefined' ||
            message.guild.musicData.songDispatcher == null){
                return message.say("Não há nenhuma música tocando")
            }
        
        if(message.guild.musicData.songDispatcher.paused){
            return message.say("A música já está pausada")
        }
        
        message.say("Música pausada :pause_button:")
        message.guild.musicData.songDispatcher.pause()
    }
}