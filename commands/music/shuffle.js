const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class ShuffleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shuffle',
      group: 'music',
      memberName: 'shuffle',
      description: 'Embaralha a fila'
    });
  }
  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }

    if (message.guild.musicData.queue.length < 1) {
      return message.say(pt_br.nomusicplayinginqueue);
    }

    ShuffleCommand.shuffleQueue(message.guild.musicData.queue);
    return message.say(pt_br.shuffledqueue);
  }
  static shuffleQueue(queue) {
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  }
};
