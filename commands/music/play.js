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

    if (query.match('^https://www.youtube.com/.*?list=.*$')) {
      let playlist;
      message.say(
        `<:youtube:753964922148225024> **Procurando por** :mag_right: \`${query}\``
      );
      try {
        playlist = await youtube.getPlaylist(query);
      } catch (e) {
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

      if (!message.guild.musicData.isPlaying) {
        message.guild.musicData.isPlaying = true;
        PlayCommand.playSong(message.guild.musicData.queue, message);
      }

      const PlaylistEmbed = PlayCommand.createPlaylistEmbed(
        message,
        playlist,
        position,
        videoObj
      );
      message.say(PlaylistEmbed);

      const queue = message.guild.musicData.queue;
      for (let i = 0; i < queue.length; i++) {
        youtube.getVideo(queue[i].url).then((video) => {
          queue[i].duration = PlayCommand.formatDuration(video.duration);
          queue[i].rawDuration = video.duration;
        });
      }
    } else if (
      query.match('^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+')
    ) {
      message.say(
        `<:youtube:753964922148225024> **Procurando por** :mag_right: \`${query}\``
      );
      youtube.getVideo(query).then((video) => {
        message.guild.musicData.queue.push(PlayCommand.constructSongObj(video));
        if (!message.guild.musicData.isPlaying) {
          message.guild.musicData.isPlaying = true;
          PlayCommand.playSong(message.guild.musicData.queue, message);
          message.say(`**Tocando** :notes: \`${video.title}\` - **Agora**!`);
        } else {
          const queueEmbed = PlayCommand.createQueueEmbed(
            message,
            video.channel.title
          );
          message.say(queueEmbed);
        }
      });
    } else {
      message.say(
        `<:youtube:753964922148225024> **Procurando por** :mag_right: \`${query}\``
      );
      const videos = await youtube.searchVideos(query, 1).catch(() => {
        return message.say('Erro ao procurar');
      });

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
            video.channel.title
          );
          message.say(queueEmbed);
        }
      });
    }
  }
  static playSong(queue, message) {
    const voiceChannel = message.member.voice.channel;
    voiceChannel
      .join()
      .then((connection) => {
        const dispatcher = connection
          .play(
            ytdl(queue[0].url, {
              filter: 'audioonly',
              quality: 'highestaudio',
              highWaterMark: 1 << 25
            }),
            { highWaterMark: 1 }
          )
          .on('start', () => {
            message.guild.musicData.songDispatcher = dispatcher;
            dispatcher.setVolume(message.guild.musicData.volume);
            message.guild.musicData.nowPlaying = queue[0];
            return queue.shift();
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
        ? durationObj.seconds + '0'
        : durationObj.seconds
        ? durationObj.seconds
        : '00'
    }`;
  }

  static createPlaylistEmbed(message, playlist, position, videoObj) {
    return new MessageEmbed()
      .setTitle(playlist.title)
      .setAuthor(
        'Playlist adicionada a fila',
        message.author.avatarURL(),
        playlist.url
      )
      .setThumbnail(videoObj[0].thumbnails.high.url)
      .addField('Estimado até tocar', 'Agora')
      .addField('Posição na fila', position == 0 ? 'Agora' : position, true)
      .addField('Adicionadas', `\`${videoObj.length}\` músicas`, true);
  }

  static createQueueEmbed(message, channel) {
    const video = message.guild.musicData.queue.slice(-1)[0];
    return new MessageEmbed()
      .setTitle(video.title)
      .setURL(video.url)
      .setThumbnail(video.thumbnail)
      .setAuthor('Adicionada a fila', message.author.avatarURL())
      .addField('Canal', channel, true)
      .addField('Duração', video.duration, true)
      .addField('Estimado tocar em', 'Teste', true)
      .addField('Posição na fila', message.guild.musicData.queue.length);
  }
};
