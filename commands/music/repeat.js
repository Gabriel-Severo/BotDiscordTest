const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class RepeatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'repeat',
      group: 'music',
      memberName: 'repeat',
      description: 'Repete a música mais uma vez'
    });
  }
  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }
    if (!message.guild.me.voice.channel) {
      return message.say(pt_br.botnotonchannel);
    }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.say(pt_br.nomusicplaying);
    }
    if (message.guild.musicData.repeat) {
      message.guild.musicData.repeat = false;
      message.guild.musicData.repeated = false;
      return message.say(':repeat_one: **Desativado!**');
    } else {
      message.guild.musicData.repeat = true;
      return message.say(':repeat_one: **Ativado!**');
    }
  }
};
