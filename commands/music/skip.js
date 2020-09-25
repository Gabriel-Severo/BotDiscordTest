const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      group: 'music',
      memberName: 'skip',
      description: 'Pula uma música'
    });
  }

  async run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.say(pt_br.nomusicplaying);
    }
    message.say(pt_br.skippedmusic);
    if (message.guild.musicData.songDispatcher.paused) {
      await message.guild.musicData.songDispatcher.resume();
      message.guild.musicData.songDispatcher.end();
    } else {
      message.guild.musicData.songDispatcher.end();
    }
    if (message.guild.musicData.looping) {
      message.guild.musicData.nowPlaying = null;
    }
    message.guild.musicData.repeated = false;
  }
};
