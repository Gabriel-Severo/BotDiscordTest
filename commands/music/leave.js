const { Command } = require('discord.js-commando')

module.exports = class LeaveCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'leave',
            group: 'music',
            memberName: 'leave',
            description: 'Sai do canal'
        })
    }

    async run(message) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) {
            return message.say("Você precisa estar conectado a um canal de voz")
        }

        if(!(typeof message.guild.musicData.songDispatcher == 'undefined' ||
        message.guild.musicData.songDispatcher == null)) {
            message.guild.musicData.queue = []
            message.guild.musicData.queue.length = 0
            message.guild.musicData.songDispatcher.end()
        }else{
            message.guild.me.voice.channel.leave()
        }

        if(!message.guild.me.voice.channel){
            return message.say("Não estou conectado a nenhum canal")
        }
        
        
    }
}