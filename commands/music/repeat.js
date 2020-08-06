const { Command } = require('discord.js-commando')

module.exports = class RepeatCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'repeat',
            group: 'music',
            memberName: 'repeat',
            description: 'Repete uma música quantas vezes for informada',
            args: [
                {
                    key: 'number',
                    default: 1,
                    type: 'integer',
                    prompt: 'Quantas vezes você gostaria de repetir essa música (máximo 5)?',
                    validate: function(number){
                        return number > 0 && number <= 20
                    }
                }
            ]
        })
    }
    run(message, {number}) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) {
            return message.say("Você precisa estar em um canal de voz")
        }

        if(typeof message.guild.musicData.songDispatcher == 'undefined' ||
            message.guild.musicData.songDispatcher == null) {
                return message.say("Não há nenhuma música tocando")
            }
        
            const nowPlaying = message.guild.musicData.nowPlaying
            for(let i = 0; i < number; i++){
                message.guild.musicData.queue.push(nowPlaying)
            }
            return message.say(`A ${nowPlaying.title} repetirá ${number} vezes`)
    }
}