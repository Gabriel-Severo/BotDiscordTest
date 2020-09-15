const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const pt_br = require('../../language/pt_br.json');

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      group: 'music',
      memberName: 'queue',
      description: 'Mostra todas as músicas da fila',
      args: [
        {
          key: 'page',
          type: 'integer',
          prompt: 'Qual página?',
          default: 1,
          validate: function (page) {
            return page > 0;
          }
        }
      ]
    });
  }
  run(message, { page }) {
    if (!message.guild.me.voice.channel) {
      return message.say(pt_br.botnotonchannel);
    }
    const allPages = Math.ceil(message.guild.musicData.queue.length / 10);
    if (message.guild.musicData.queue.length < 10 || allPages < page) {
      page = 1;
    }
    const queueEmbed = new MessageEmbed()
      .setTitle(`Fila para ${message.guild.name}`)
      .setURL('https://www.google.com')
      .setFooter(
        `Página ${page}/${allPages == 0 ? 1 : allPages}`,
        message.author.avatarURL()
      );

    let description = '';
    if (
      message.guild.musicData.queue.length == 0 &&
      message.guild.musicData.nowPlaying == null
    ) {
      description += '__Tocando agora:__';
      description += '\nNada, vamos começar a festa!:tada:';
      queueEmbed.setDescription(description);
      return message.say(queueEmbed);
    }

    if (page == 1) {
      description += '__Tocando agora:__';
      const nowPlaying = message.guild.musicData.nowPlaying;
      description += `\n[${nowPlaying.title}](${nowPlaying.url}) \`${nowPlaying.length} | Requisitado por: ${nowPlaying.requestedBy}\`\n`;
      if (message.guild.musicData.queue.length > 0) {
        description += '\n__A seguir:__';
      }
    }

    let musics;
    if (page == allPages) {
      const total = message.guild.musicData.queue.length;
      const inicial = (allPages - 1) * 10;
      musics = message.guild.musicData.queue.slice(inicial, total);
    } else {
      musics = message.guild.musicData.queue.slice(
        (page - 1) * 10,
        (page - 1) * 10 + 10
      );
    }
    for (let i = 0; i < musics.length; i++) {
      description += `\n\`${(page - 1) * 10 + i + 1}\`. [${musics[i].title}](${
        musics[i].url
      }) | \`${musics[i].length} Requisitado por: ${musics[i].requestedBy}\`\n`;
    }
    const estimated = QueueCommand.estimatedToPlay(message);
    description += `\n**${message.guild.musicData.queue.length} músicas na fila | ${estimated} tempo total estimado**`;
    queueEmbed.setDescription(description);
    return message.say(queueEmbed);
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
  static estimatedToPlay(message) {
    let totalMS = 0;
    message.guild.musicData.queue.forEach((video) => {
      totalMS += video.duration.ms;
    });
    const time = {
      seconds: ~~((totalMS / 1000) % 60),
      minutes: ~~((totalMS / (1000 * 60)) % 60),
      hours: ~~((totalMS / (1000 * 3600)) % 24)
    };
    return this.formatDuration(time);
  }
};
