const { Command } = require('discord.js-commando')
const { MessageManager } = require('discord.js')

module.exports = class TempoCommand extends Command {
    constructor(client){
        super(client, {
            name: 'tempo',
            group: 'zoeira',
            memberName: 'tempo',
            description: 'Tempo'
        })
    }
    async run(message){
        const final = new Date(Date.UTC(2020, 11, 15, 16, 0, 0))
        let dia = new Date()
        let diferenca = final - dia
        let obj = {
            segundos: Math.floor(diferenca / 1000),
            minutos: Math.floor(diferenca / (1000 * 60)),
            horas: Math.floor(diferenca / (1000 * 3600)),
            dias: Math.floor(diferenca / (1000 * 86400)),
            semanas: Math.floor(diferenca / (1000 * 604800)),
            meses: Math.floor(diferenca / (1000 * 2419200))
        }
        message.delete()
        const mensagem = await message.say(`${obj.segundos} segundos\n${obj.minutos} minutos e ${obj.segundos % 60} segundos\n${obj.horas} horas, ${obj.minutos % 60} minutos e ${obj.segundos % 60} segundos\n${obj.dias} dias, ${obj.horas % 24} horas, ${obj.minutos % 60} minutos e ${obj.segundos % 60} segundos\n${obj.semanas} semanas, ${obj.horas % 24} horas, ${obj.minutos % 60} minutos e ${obj.segundos % 60} segundos\n${obj.meses} meses, ${Math.floor(obj.dias % 30.5)} dias, ${obj.horas % 24} horas, ${obj.minutos % 60} minutos e ${obj.segundos % 60} segundos`)
        setInterval(() => {
            dia = new Date()
            diferenca = final - dia
            obj = {
                segundos: Math.floor(diferenca / 1000),
                minutos: Math.floor(diferenca / (1000 * 60)),
                horas: Math.floor(diferenca / (1000 * 3600)),
                dias: Math.floor(diferenca / (1000 * 86400)),
                semanas: Math.floor(diferenca / (1000 * 604800)),
                meses: Math.floor(diferenca / (1000 * 2419200))
            }
            mensagem.edit(`${obj.segundos} segundos\n${obj.minutos} minutos e ${obj.segundos % 60} segundos\n${obj.horas} horas, ${obj.minutos % 60} minutos e ${obj.segundos % 60} segundos\n${obj.dias} dias, ${obj.horas % 24} horas, ${obj.minutos % 60} minutos e ${obj.segundos % 60} segundos\n${obj.semanas} semanas, ${obj.horas % 24} horas, ${obj.minutos % 60} minutos e ${obj.segundos % 60} segundos\n${obj.meses} meses, ${Math.floor(obj.dias % 30.5)} dias, ${obj.horas % 24} horas, ${obj.minutos % 60} minutos e ${obj.segundos % 60} segundos`)
        }, 1000)
    }
}