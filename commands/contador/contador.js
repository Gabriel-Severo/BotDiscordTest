const { Command } = require('discord.js-commando');
const { Contador } = require('../../services/contador');
const db = require('../../config/database');

module.exports = class ContadorCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'contador',
      group: 'contador',
      memberName: 'contador',
      description: 'Comandos do contador',
      args: [
        {
          key: 'arg1',
          prompt: 'Argumento',
          type: 'string'
        }
      ]
    });
  }
  async run(message, { arg1 }) {
    const contadorInfo = {};
    if (arg1 === 'create') {
      message.say('**Informe o id do canal para criar o contador**');
      await message.channel
        .awaitMessages(
          (msg) => {
            return msg.content > 0;
          },
          {
            max: 1,
            time: 60000,
            errors: ['time']
          }
        )
        .then((response) => {
          contadorInfo.channel_id = response.first().content;
        });
      message.say(
        '**Informe o dia, mês e ano até quando o contador irá contar no formato DD/MM/AAAA**'
      );
      await message.channel
        .awaitMessages(
          (msg) => {
            return msg.content.match('[0-9]{2}/[0-9]{2}/[0-9]{4}');
          },
          {
            max: 1,
            time: 60000,
            errors: ['time']
          }
        )
        .then((response) => {
          contadorInfo.date = response.first().content;
        });
      message.say(
        '**Informe a hora e o minuto até quando o contador irá contar no formato HH:MM**'
      );
      await message.channel
        .awaitMessages(
          (msg) => {
            return msg.content.match('[0-9]{2}:[0-9]{2}');
          },
          {
            max: 1,
            time: 60000,
            errors: ['time']
          }
        )
        .then((response) => {
          contadorInfo.time = response.first().content;
        });
      const date = contadorInfo.date.split('/');
      const time = contadorInfo.time.split(':');
      const contador = new Contador(
        new Date(Date.UTC(date[2], date[1], date[0], time[0], time[1], 0))
      );
      const mensagem = await message.channel.guild.channels.cache
      .get(contadorInfo.channel_id)
      .send('Criando contador');
      db.query(
        'INSERT INTO contador (canal_id, mensagem_id, dia, mes, ano, horas, minutos) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [contadorInfo.channel_id, mensagem.id, date[0], date[1], date[2], time[0], time[1]]
      );
      setInterval(async () => {
        contador.calculateTime();
        mensagem.edit(`=-=-=-=-=-=-=-=-  Tempo restante  -=-=-=-=-=-=-=-=
          \t\t\t\t\t\t\t\t${contador.getSeconds()} segundos
          \t\t\t\t\t\t${contador.getMinutes()} minutos e ${
          contador.getSeconds() % 60
        } segundos
          \t\t\t\t\t${contador.getHours()} horas, ${
          contador.getMinutes() % 60
        } minutos e ${contador.getSeconds() % 60} segundos
          \t\t\t\t${contador.getDays()} dias, ${
          contador.getHours() % 24
        } horas, ${contador.getMinutes() % 60} minutos e ${
          contador.getSeconds() % 60
        } segundos
          \t\t\t${contador.getWeeks()} semanas, ${
          contador.getHours() % 24
        } horas, ${contador.getMinutes() % 60} minutos e ${
          contador.getSeconds() % 60
        } segundos
          \t\t${contador.getMonths()} meses, ${Math.floor(
          contador.getDays() / 30.5
        )} dias, ${contador.getHours() % 24} horas, ${
          contador.getMinutes() % 60
        } minutos e ${contador.getSeconds() % 60} segundos
                `);
      }, 5000);
    }
  }
};
