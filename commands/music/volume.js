const { Command } = require('discord.js-commando')

module.exports = class VolumeCommand extends Command {
    constructor(client){
        super(client, {
            name: 'volume',
            group: 'music',
            memberName: 'volume',
            description: 'Seta um volume para a música',
            args: [
                {
                    key: 'wantedVolume',
                    prompt: 'Qual o volume você gostaria de setar',
                    type: 'integer',
                    validate: function(wantedVolume) {
                        return wantedVolume >= 0 && wantedVolume <= 200
                    }
                }
            ]
        })
    }
    run(message, {wantedVolume}){
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel){
            message.say("Você precisa estar conectado em um canal de voz")
        }
        if(message.guild.musicData.songDispatcher == null ||
            typeof message.guild.musicData.songDispatcher == 'undefined'){
                return message.say("Não há nada tocando agora")
            }
        let volume = 0
        if(!wantedVolume == 0){
            volume = wantedVolume / 100
        }
        message.guild.musicData.volume = volume
        message.guild.musicData.songDispatcher.setVolume(volume)
        message.say(`O volume foi setado para ${wantedVolume}%`)
        
    }
}