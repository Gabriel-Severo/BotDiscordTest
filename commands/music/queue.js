const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

module.exports = class QueueCommand extends Command {
    constructor(client){
        super(client, {
            name: 'queue',
            group: 'music',
            memberName: 'queue',
            description: 'Mostra todas as músicas da fila'
        })
    }
    run(message){
        if(message.guild.musicData.queue.length == 0){
            return message.say("A fila está vazia")
        }

        const queueEmbed = new MessageEmbed()
            .setColor("#ff7373")
            .setTitle('Fila de música')
        for(let i = 0; i < message.guild.musicData.queue.length; i++){
            queueEmbed.addField(`${i + 1}:`, `${message.guild.musicData.queue[i].title}`)
        }
        return message.say(queueEmbed)
    }
}