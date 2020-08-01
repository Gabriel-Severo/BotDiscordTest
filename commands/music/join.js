const { Command } = require('discord.js-commando')

module.exports = class JoinCommand extends Command {
    constructor(client){
        super(client, {
            name: 'join',
            group: 'music',
            memberName: 'join',
            description: 'Entra no canal'
        })
    }
    run(message){
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel){
            return message.say("Você precisa estar conectado a um canal")
        }

        message.member.voice.channel.join()
    }
}