const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class LoopCommando extends Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      group: 'music',
      memberName: 'loop',
      description: 'Coloca uma música em loop'
    });
  }
  run(message) {
    const voiceChannel = message.guild.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.say('Não há nenhuma música tocando');
    }

    if (message.guild.musicData.looping) {
      message.say(':repeat_one: **Desativado!**');
      message.guild.musicData.looping = false;
    } else {
      message.say(':repeat_one: **Ativado!**');
      message.guild.musicData.looping = true;
    }
  }
};
