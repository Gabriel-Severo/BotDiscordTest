const { Command } = require('discord.js-commando');
const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');
const pt_br = require('../../language/pt_br.json');
const youtube = require('../../services/youtube');
const { estimatedToPlay } = require('../../services/util');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'music',
      memberName: 'play',
      description: 'Toca uma música ou uma playlist',
      args: [
        {
          key: 'query',
          prompt: 'Qual música você gostaria de ouvir?',
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
    const estimated = estimatedToPlay(message, true);
    const requestedBy = `${message.author.username}#${message.author.discriminator}`;
    if (query.match('^https://www.youtube.com/.*?list=.*$')) {
      message.say(
        `<:youtube:753961795277815868> **Procurando por** :mag_right: \`${query}\``
      );

      const playlist = await youtube(query);
      if (!playlist){
        return message.say(":x: **Essa Playlist não existe ou está privada**")
      }

      const position = message.guild.musicData.queue.length;

      for (let video of playlist.videos) {
        video.requestedBy = requestedBy;
        message.guild.musicData.queue.push(video);
      }

      if (!message.guild.musicData.isPlaying) {
        message.guild.musicData.isPlaying = true;
        PlayCommand.playSong(message.guild.musicData.queue, message);
      }
      const PlaylistEmbed = PlayCommand.createPlaylistEmbed(
        message,
        playlist,
        position,
        estimated
        );
      message.say(PlaylistEmbed);
    } else if (
      query.match('^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+')
    ) {
      message.say(
        `<:youtube:753961795277815868> **Procurando por** :mag_right: \`${query}\``
      );
      const video = await youtube(query);
      if(!video){
        return message.say(":x: **Nada encontrado**")
      }
      video.requestedBy = requestedBy;
      message.guild.musicData.queue.push(video);
      if (!message.guild.musicData.isPlaying) {
        message.guild.musicData.isPlaying = true;
        PlayCommand.playSong(message.guild.musicData.queue, message);
        message.say(`**Tocando** :notes: \`${video.title}\` - **Agora**!`);
      } else {
        const queueEmbed = PlayCommand.createQueueEmbed(message, estimated);
        message.say(queueEmbed);
      }
    } else {
      message.say(
        `<:youtube:753961795277815868> **Procurando por** :mag_right: \`${query}\``
      );

      let video = await youtube(query);

      if(!video){
        return message.say(":x: **Nada encontrado**")
      }

      video.requestedBy = requestedBy;
      message.guild.musicData.queue.push(video);
      if (!message.guild.musicData.isPlaying) {
        message.guild.musicData.isPlaying = true;
        PlayCommand.playSong(message.guild.musicData.queue, message);
        message.say(`**Tocando** :notes: \`${video.title}\` - **Agora**!`);
      } else {
        const queueEmbed = PlayCommand.createQueueEmbed(message, estimated);
        message.say(queueEmbed);
      }
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
              quality: 'highestaudio'
            })
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
              message.guild.musicData.nowPlaying != null
            ) {
              guildQueue.unshift(message.guild.musicData.nowPlaying);
            } else if (
              message.guild.musicData.repeat &&
              message.guild.musicData.nowPlaying != null
            ) {
              if (!message.guild.musicData.repeated) {
                guildQueue.unshift(message.guild.musicData.nowPlaying);
                message.guild.musicData.repeated = true;
              } else {
                message.guild.musicData.repeated = false;
              }
            }
            if (guildQueue.length >= 1) {
              return this.playSong(guildQueue, message);
            } else {
              PlayCommand.finishQueue(message);
            }
          })
          .on('error', (e) => {
            message.say('Cannot play song');
            console.error(e);
            PlayCommand.finishQueue(message);
          });
      })
      .catch((e) => {
        message.say('Cannot play song');
        console.error(e);
        PlayCommand.finishQueue(message);
      });
  }

  static createPlaylistEmbed(message, playlist, position, estimated) {
    return new MessageEmbed()
      .setTitle(playlist.title)
      .setAuthor(
        'Playlist adicionada a fila',
        message.author.avatarURL(),
        playlist.url
      )
      .setThumbnail(playlist.thumbnail)
      .addField(
        'Estimado até tocar',
        estimated === '0:00' ? 'Agora' : estimated
      )
      .addField('Posição na fila', position == 0 ? 'Agora' : position + 1, true)
      .addField('Adicionadas', `\`${playlist.videos.length}\` músicas`, true);
  }

  static createQueueEmbed(message, estimated) {
    const video = message.guild.musicData.queue.slice(-1)[0];
    return new MessageEmbed()
      .setTitle(video.title)
      .setURL(video.url)
      .setThumbnail(video.thumbnail)
      .setAuthor('Adicionada a fila', message.author.avatarURL())
      .addField('Canal', video.author, true)
      .addField('Duração', video.length, true)
      .addField(
        'Estimado tocar em',
        estimated == '0:00' ? 'Agora' : estimated,
        true
      )
      .addField('Posição na fila', message.guild.musicData.queue.length);
  }
  static finishQueue(message) {
    message.guild.musicData.isPlaying = false;
    message.guild.musicData.nowPlaying = null;
    message.guild.musicData.songDispatcher = null;
    message.guild.musicData.looping = false;
    message.guild.musicData.repeat = false;
    message.guild.musicData.repeated = false;
    message.guild.musicData.queue = [];

    if (message.guild.me.voice.channel) {
      return message.guild.me.voice.channel.leave();
    }
  }
};
