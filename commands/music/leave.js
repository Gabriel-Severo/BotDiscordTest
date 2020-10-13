const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      group: 'music',
      memberName: 'leave',
      description: 'Sai do canal'
    });
  }

  async run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }

    if (
      !(
        typeof message.guild.musicData.songDispatcher == 'undefined' ||
        message.guild.musicData.songDispatcher == null
      )
    ) {
      if (message.guild.musicData.looping) {
        message.guild.musicData.nowPlaying = null;
      }
      message.guild.musicData.queue = [];
      message.guild.musicData.songDispatcher.end();
    } else if (!message.guild.me.voice.channel) {
      return message.say(pt_br.botnotonchannel);
    }

    message.say(pt_br.leavechannel);

    message.guild.me.voice.channel.leave();
  }
};
