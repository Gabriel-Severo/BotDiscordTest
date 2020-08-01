const { Command } = require('discord.js-commando')

module.exports = class RemoveCommand extends Command {
    constructor(client){
        super(client, {
            name: 'remove',
            group: 'music',
            memberName: 'remove',
            description: 'Remove uma música da fila',
            args:[
                {
                    key: 'songNumber',
                    prompt: 'Qual múica você gostaria de remover',
                    type: 'integer'
                }
            ]
        })
    }
    run(message, { songNumber }){
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel){
            return message.say("Você precisa estar conectado a um canal")
        }
        if(typeof message.guild.musicData.songDispatcher == 'undefined' ||
            message.guild.musicData.songDispatcher == null) {
                return message.say("Não há nenhuma música tocando")
            }
        if(songNumber < 1 || songNumber >= message.guild.musicData.queue.length){
            return message.reply("Essa música é inválida. Informe um música válida")
        }
        const removed = message.guild.musicData.queue.splice(songNumber -1, 1)[0]
        return message.say(`${removed.title} foi removida da fila`)
    }
}