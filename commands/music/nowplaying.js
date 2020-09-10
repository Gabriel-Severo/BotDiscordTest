const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      group: 'music',
      memberName: 'nowplaying',
      description: 'Mostra a música que está tocando'
    });
  }

  run(message) {
    if (
      !message.guild.musicData.isPlaying &&
      !message.guild.musicData.nowPlaying
    ) {
      return message.say('Não há nenhuma música tocando no momento');
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
      return message.say('Não há nenhuma música tocando no momento');
    }

    const messageEmbed = new MessageEmbed()
      .setThumbnail(video.thumbnail)
      .setColor('#e9f931')
      .setTitle(video.title)
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

    const timePassedInMSFormated = NowPlayingCommand.formatDuration(
      timePassedInMSObj
    );

    const totalDurationObj = video.rawDuration;
    const totalDurationFormated = NowPlayingCommand.formatDuration(
      totalDurationObj
    );

    let totalDurationInMS = 0;
    Object.keys(totalDurationObj).forEach((key) => {
      if (key == 'hours') totalDurationInMS += totalDurationObj[key] * 3600000;
      else if (key == 'minutes')
        totalDurationInMS += totalDurationObj[key] * 60000;
      else if (key == 'seconds')
        totalDurationInMS += totalDurationObj[key] * 100;
    });

    const playBackBarLocation = Math.round(
      (passedTimeInMS / totalDurationInMS) * 10
    );

    let playBack = '';
    for (let i = 0; i < 21; i++) {
      if (playBackBarLocation == 0) {
        playBack = ':musical_note:▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        break;
      } else if (playBackBarLocation == 10) {
        playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬:musical_note:';
        break;
      } else if (i == playBackBarLocation * 2) {
        playBack += ':musical_note:';
      } else {
        playBack += '▬';
      }
    }

    return `${timePassedInMSFormated} ${playBack} ${totalDurationFormated}`;
  }

  static formatDuration(duration) {
    return `${duration.hours ? duration.hours + ':' : ''}${
      duration.minutes ? duration.minutes : '00'
    }:${
      duration.seconds < 10
        ? '0' + duration.seconds
        : duration.seconds
        ? duration.seconds
        : '00'
    }`;
  }
};
