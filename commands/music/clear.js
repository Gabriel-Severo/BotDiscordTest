const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class ClearCommando extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      group: 'music',
      memberName: 'clear',
      description: 'Limpa a fila'
    });
  }
  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }
    if (message.guild.musicData.queue.length == 0) {
      return message.say('Não há nenhuma música na fila');
    }
    message.guild.musicData.queue = [];
    message.guild.musicData.queue.length = 0;
    return message.say('Fila limpa!');
  }
};
