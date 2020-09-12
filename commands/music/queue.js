const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

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
      return message.say(
        ':x:**Eu não estou conectado a nenhum canal de voz**, use o comando join para me colocar em um'
      );
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
    if (message.guild.musicData.queue.length == 0) {
      description += '__Tocando agora:__';
      description += '\nNada, vamos começar a festa!:tada:';
      queueEmbed.setDescription(description);
      return message.say(queueEmbed);
    }

    if (page == 1) {
      description += '__Tocando agora:__';
      const nowPlaying = message.guild.musicData.nowPlaying;
      description += `\n[${nowPlaying.title}](${nowPlaying.url}) \`${nowPlaying.duration} | Requisitado por: ${message.author.username}#${message.author.discriminator}\`\n`;
      description += '\n__A seguir:__';
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
      }) | \`${musics[i].duration} Requisitado por: ${
        message.author.username
      }#${message.author.discriminator}\`\n`;
    }
    queueEmbed.setDescription(description);
    return message.say(queueEmbed);
  }
};
