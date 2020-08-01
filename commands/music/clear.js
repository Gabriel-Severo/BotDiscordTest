const { Command } = require('discord.js-commando')

module.exports = class ClearCommando extends Command {
    constructor(client){
        super(client, {
            name: 'clear',
            group: 'music',
            memberName: 'clear',
            description: 'Limpa a fila'
        })
    }
    run(message){
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel){
            return message.say("Você precisa estar conectado a um canal de voz")
        }
        if(message.guild.musicData.queue.length == 0) {
            return message.say("Não há nenhuma música na fila")
        }
        message.guild.musicData.queue = []
        message.guild.musicData.queue.length = 0
        return message.say("Fila limpa!")
    }
}