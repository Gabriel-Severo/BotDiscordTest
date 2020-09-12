const { youtube_api } = require('../../config.json');
const { Command } = require('discord.js-commando');
const Youtube = require('simple-youtube-api');
const youtube = new Youtube(youtube_api);
const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');
const pt_br = require('../../language/pt_br.json');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'music',
      memberName: 'play',
      description: 'Play a song',
      args: [
        {
          key: 'query',
          prompt: 'What song or playlist would you like to listen to?',
          type: 'string',
          validate: function (query) {
            return query.length > 0 && query.length < 200;
          }
        }
      ]
    });
  }

  async run(message, { query }) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }
    if (!message.guild.me.voice.channel) {
      message.say(
        `:thumbsup: **Conectado em** \`${voiceChannel.parent.name}\` :page_facing_up: **No canal** \`${voiceChannel.name}\` `
      );
    }
    const estimated = PlayCommand.estimatedToPlay(message);
    if (query.match('^https://www.youtube.com/.*?list=.*$')) {
      let playlist;
      message.say(
        `<:youtube:753961795277815868> **Procurando por** :mag_right: \`${query}\``
      );
      try {
        playlist = await youtube.getPlaylist(query);
      } catch {
        return message.say(pt_br.playlisterror);
      }

      const videoObj = await playlist.getVideos().catch(() => {
        console.log(pt_br.videoserror);
      });

      const position = message.guild.musicData.queue.length;

      for (let i = 0; i < videoObj.length; i++) {
        if (videoObj[i].raw.status.privacyStatus === 'private') {
          continue;
        } else {
          message.guild.musicData.queue.push(
            PlayCommand.constructSongObj(videoObj[i], true)
          );
        }
      }

      const queue = message.guild.musicData.queue;
      if (!message.guild.musicData.isPlaying) {
        await youtube.getVideo(queue[0].url).then((video) => {
          queue[0].duration = PlayCommand.formatDuration(video.duration);
          queue[0].rawDuration = video.duration;
        });
        message.guild.musicData.isPlaying = true;
        PlayCommand.playSong(message.guild.musicData.queue, message);
      }

      const PlaylistEmbed = PlayCommand.createPlaylistEmbed(
        message,
        playlist,
        position,
        videoObj,
        estimated
      );
      message.say(PlaylistEmbed);

      for (let i = 0; i < queue.length; i++) {
        await youtube.getVideo(queue[i].url).then((video) => {
          queue[i].duration = PlayCommand.formatDuration(video.duration);
          queue[i].rawDuration = video.duration;
        });
      }
    } else if (
      query.match('^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+')
    ) {
      message.say(
        `<:youtube:753961795277815868> **Procurando por** :mag_right: \`${query}\``
      );
      youtube
        .getVideo(query)
        .then((video) => {
          message.guild.musicData.queue.push(
            PlayCommand.constructSongObj(video)
          );
          if (!message.guild.musicData.isPlaying) {
            message.guild.musicData.isPlaying = true;
            PlayCommand.playSong(message.guild.musicData.queue, message);
            message.say(`**Tocando** :notes: \`${video.title}\` - **Agora**!`);
          } else {
            const queueEmbed = PlayCommand.createQueueEmbed(
              message,
              video.channel.title,
              estimated
            );
            message.say(queueEmbed);
          }
        })
        .catch((e) => {
          console.log(e.errors[0]);
          return message.say(
            `**:bug: Erro ao procurar:** \`${e.errors[0].reason}\``
          );
        });
    } else {
      message.say(
        `<:youtube:753961795277815868> **Procurando por** :mag_right: \`${query}\``
      );

      let videos;
      try {
        videos = await youtube.searchVideos(query, 1);
      } catch (e) {
        console.log(e.errors[0]);
        return message.say(
          `**:bug: Erro ao procurar:** \`${e.errors[0].reason}\``
        );
      }

      if (videos == false) {
        return message.say('Nenhum vídeo foi encontrado');
      }

      youtube.getVideoByID(videos[0].id).then((video) => {
        message.guild.musicData.queue.push(PlayCommand.constructSongObj(video));
        if (!message.guild.musicData.isPlaying) {
          message.guild.musicData.isPlaying = true;
          PlayCommand.playSong(message.guild.musicData.queue, message);
          message.say(`**Tocando** :notes: \`${video.title}\` - **Agora**!`);
        } else {
          const queueEmbed = PlayCommand.createQueueEmbed(
            message,
            video.channel.title,
            estimated
          );
          message.say(queueEmbed);
        }
      });
    }
  }
  static playSong(queue, message) {
    message.guild.musicData.nowPlaying = queue[0];
    queue.shift();

    const voiceChannel = message.member.voice.channel;
    voiceChannel
      .join()
      .then((connection) => {
        const nowPlaying = message.guild.musicData.nowPlaying;
        const dispatcher = connection
          .play(
            ytdl(nowPlaying.url, {
              filter: 'audioonly',
              quality: 'highestaudio',
              highWaterMark: 1 << 25
            }),
            { highWaterMark: 1 }
          )
          .on('start', () => {
            message.guild.musicData.songDispatcher = dispatcher;
            dispatcher.setVolume(message.guild.musicData.volume);
            return;
          })
          .on('finish', () => {
            const guildQueue = message.guild.musicData.queue;
            if (
              message.guild.musicData.looping &&
              !message.guild.musicData.nowPlaying == null
            ) {
              return guildQueue.unshift(message.guild.musicData.nowPlaying);
            }
            if (guildQueue.length >= 1) {
              return this.playSong(guildQueue, message);
            } else {
              message.guild.musicData.isPlaying = false;
              message.guild.musicData.nowPlaying = null;
              message.guild.musicData.songDispatcher = null;
              if (message.guild.me.voice.channel) {
                return message.guild.me.voice.channel.leave();
              }
            }
          })
          .on('error', (e) => {
            message.say('Cannot play song');
            console.error(e);
            message.guild.musicData.queue.length = 0;
            message.guild.musicData.isPlaying = false;
            message.guild.musicData.nowPlaying = null;
            message.guild.musicData.songDispatcher = null;
            return message.guild.me.voice.channel.leave();
          });
      })
      .catch((e) => {
        console.log(e);
        return message.guild.me.voice.channel.leave();
      });
  }

  static constructSongObj(video, durationCal = false) {
    if (durationCal) {
      video.duration = {
        hours: 0,
        minutes: 0,
        seconds: 1
      };
    }
    let duration = this.formatDuration(video.duration);
    if (duration == '00:00') duration = 'Live Stream';
    return {
      url: `https://www.youtube.com/watch?v=${video.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration,
      thumbnail: video.thumbnails.high.url
    };
  }

  static formatDuration(durationObj) {
    return `${durationObj.hours ? durationObj.hours + ':' : ''}${
      durationObj.minutes ? durationObj.minutes : '00'
    }:${
      durationObj.seconds < 10
        ? '0' + durationObj.seconds
        : durationObj.seconds
        ? durationObj.seconds
        : '00'
    }`;
  }

  static createPlaylistEmbed(message, playlist, position, videoObj, estimated) {
    return new MessageEmbed()
      .setTitle(playlist.title)
      .setAuthor(
        'Playlist adicionada a fila',
        message.author.avatarURL(),
        playlist.url
      )
      .setThumbnail(videoObj[0].thumbnails.high.url)
      .addField('Estimado até tocar', estimated == 0 ? 'Agora' : estimated)
      .addField('Posição na fila', position == 0 ? 'Agora' : position + 1, true)
      .addField('Adicionadas', `\`${videoObj.length}\` músicas`, true);
  }

  static createQueueEmbed(message, channel, estimated) {
    const video = message.guild.musicData.queue.slice(-1)[0];
    return new MessageEmbed()
      .setTitle(video.title)
      .setURL(video.url)
      .setThumbnail(video.thumbnail)
      .setAuthor('Adicionada a fila', message.author.avatarURL())
      .addField('Canal', channel, true)
      .addField('Duração', video.duration, true)
      .addField('Estimado tocar em', estimated == 0 ? 'Agora' : estimated, true)
      .addField('Posição na fila', message.guild.musicData.queue.length);
  }

  static timeInMS(totalDurationObj) {
    let totalDurationInMS = 0;
    Object.keys(totalDurationObj).forEach((key) => {
      if (key == 'hours') totalDurationInMS += totalDurationObj[key] * 3600000;
      else if (key == 'minutes')
        totalDurationInMS += totalDurationObj[key] * 60000;
      else if (key == 'seconds')
        totalDurationInMS += totalDurationObj[key] * 1000;
    });
    return totalDurationInMS;
  }

  static estimatedToPlay(message) {
    let totalMS = 0;
    message.guild.musicData.queue.forEach((video) => {
      totalMS += this.timeInMS(video.rawDuration);
    });

    const songDispatcher = message.guild.musicData.songDispatcher;
    const streamTimePassed =
      songDispatcher == null ? 0 : songDispatcher.streamTime;
    const nowPlaying = message.guild.musicData.nowPlaying;
    const totalTimeInMs =
      nowPlaying == null ? 0 : this.timeInMS(nowPlaying.rawDuration);

    totalMS += totalTimeInMs - streamTimePassed;
    const time = {
      seconds: Math.floor((totalMS / 1000) % 60),
      minutes: Math.floor((totalMS / (1000 * 60)) % 60),
      hours: Math.floor((totalMS / (1000 * 3600)) % 24)
    };
    return this.formatDuration(time);
  }
};
