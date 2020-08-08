const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

module.exports = class QueueCommand extends Command {
    constructor(client){
        super(client, {
            name: 'queue',
            group: 'music',
            memberName: 'queue',
            description: 'Mostra todas as músicas da fila',
            args: [
                {
                    key: 'page',
                    type: 'integer',
                    prompt: 'Qual página?',
                    default: 1,
                    validate: function(page){
                        return page > 0
                    }
                }
            ]
        })
    }
    run(message, {page}){
        const allPages = Math.ceil(message.guild.musicData.queue.length / 10)
        if(message.guild.musicData.queue.length < 10){
            page = 1
        }else if(allPages < page){
            return message.say("Página inválida")
        }
        if(message.guild.musicData.queue.length == 0){
            return message.say("A fila está vazia")
        }

        const queueEmbed = new MessageEmbed()
            .setColor("#ff7373")
            .setTitle('Fila de música')
        
        let musics;
        if(page == allPages){
            const total = message.guild.musicData.queue.length
            const inicial = ((allPages-1) * 10)
            musics = message.guild.musicData.queue.slice(inicial, total)
            for(let i = 0; i < musics.length; i++){
                queueEmbed.addField(`${(page-1) * 10 + i + 1}:`, `${musics[i].title}`)
            }
        }else{
            musics = message.guild.musicData.queue.slice((page-1)*10, (page-1)*10+10)
            for(let i = 0; i < musics.length; i++){
                queueEmbed.addField(`${(page-1) * 10 + i + 1}:`, `${musics[i].title}`)
            }
        }
        queueEmbed.addField(`${page}/${allPages}`, '-')
        return message.say(queueEmbed)
    }
}