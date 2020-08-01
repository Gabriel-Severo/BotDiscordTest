const { Command } = require('discord.js-commando')

module.exports = class ShuffleCommand extends Command {
    constructor(client){
        super(client, {
            name: 'shuffle',
            group: 'music',
            memberName: 'shuffle',
            description: 'Embaralha a fila'
        })
    }
    run(message){
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel){
            return message.say("Você precisa estar conectado a um canal de voz")
        }

        if(typeof message.guild.musicData.songDispatcher == 'undefined' ||
            message.guild.musicData.songDispatcher == null){
                return message.say("Não há nenhuma música tocando no momento")
            }
        
        if(message.guild.musicData.queue.length < 1){
            return message.say("Não há nenhuma música na fila")
        }

        ShuffleCommand.shuffleQueue(message.guild.musicData.queue)
        return message.say(`${message.guild.musicData.queue.length} músicas foram embaralhadas`)

    }
    static shuffleQueue(queue){
        for(let i = queue.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }
    }
}
