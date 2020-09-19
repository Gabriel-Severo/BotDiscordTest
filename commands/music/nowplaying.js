const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const pt_br = require('../../language/pt_br.json');
const { formatDuration } = require('../../services/util');

module.exports = class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      aliases: ['np'],
      group: 'music',
      memberName: 'nowplaying',
      description: 'Mostra a música que está tocando'
    });
  }

  run(message) {
    if (!message.guild.me.voice.channel) {
      return message.say(pt_br.botnotonchannel);
    }
    if (!message.guild.musicData.nowPlaying) {
      return message.say(pt_br.nomusicplaying);
    }

    const video = message.guild.musicData.nowPlaying;

    let description;
    try {
      if (video.duration === 'Live Stream') {
        description = video.duration;
      } else {
        description = NowPlayingCommand.playbackBar(message, video);
      }
    } catch (e) {
      return message.say(pt_br.nomusicplaying);
    }

    const messageEmbed = new MessageEmbed()
      .setThumbnail(video.thumbnail)
      .setAuthor(
        'Tocando Agora ♪',
        message.author.avatarURL(),
        'https://google.com'
      )
      .setDescription(description);
    message.say(messageEmbed);
  }
  static playbackBar(message, video) {
    const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime;
    const timePassedInMSObj = {
      seconds: Math.floor((passedTimeInMS / 1000) % 60),
      minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
      hours: Math.floor((passedTimeInMS / (1000 * 3600)) % 24)
    };

    const timePassedInMSFormated = formatDuration(timePassedInMSObj);

    const totalDurationObj = video.duration;
    const totalDurationFormated = formatDuration(totalDurationObj);

    let totalDurationInMS =
      totalDurationObj['hours'] * 3600000 +
      totalDurationObj['minutes'] * 60000 +
      totalDurationObj['seconds'] * 1000;

    const playBackBarLocation = Math.round(
      (passedTimeInMS / totalDurationInMS) * 10
    );

    let playBack = '';
    for (let i = 0; i < 30; i++) {
      if (playBackBarLocation == 0) {
        playBack = '🔘▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        break;
      } else if (playBackBarLocation == 10) {
        playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬🔘';
        break;
      } else if (i == playBackBarLocation * 3) {
        playBack += '🔘';
      } else {
        playBack += '▬';
      }
    }

    return `[${video.title}](${video.url})\n\n\`${playBack}\`\n\n\`${timePassedInMSFormated} / ${totalDurationFormated}\`\n\n\`Requisitado por:\` ${video.requestedBy}`;
  }
};
