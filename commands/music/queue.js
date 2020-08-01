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
        const allPages = Math.floor(message.guild.musicData.queue.length / 10)
        if(message.guild.musicData.queue < 10){
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
            const remain = total - (allPages * 10)
            musics = message.guild.musicData.queue.slice(page*10, total)
            for(let i = 0; i < remain; i++){
                queueEmbed.addField(`${(page-1) * 10 + i + 1}:`, `${musics[i].title}`)
            }
        }else{
            musics = message.guild.musicData.queue.slice(page*10, page*10+10)
            for(let i = 0; i < 10; i++){
                queueEmbed.addField(`${(page-1) * 10 + i + 1}:`, `${musics[i].title}`)
            }
        }
        queueEmbed.addField(`${page}/${allPages}`, '-')
        return message.say(queueEmbed)
    }
}