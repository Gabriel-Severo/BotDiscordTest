const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class ResumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      group: 'music',
      memberName: 'resume',
      description: 'Volta a tocar a música que foi pausada'
    });
  }

  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.say('Não há nenhuma música tocando');
    }

    if (!message.guild.musicData.songDispatcher.paused) {
      return message.say('A música não está pausada');
    }

    message.say('Música retomada :play_pause:');
    message.guild.musicData.songDispatcher.resume();
  }
};
