const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');
module.exports = class MoveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'move',
      group: 'music',
      memberName: 'move',
      description: 'Move uma música para uma posição especificada',
      args: [
        {
          key: 'oldPosition',
          type: 'integer',
          prompt: 'Qual a posição da música?'
        },
        {
          key: 'newPosition',
          type: 'integer',
          prompt: 'Qual a nova posição para a música?'
        }
      ]
    });
  }
  run(message, { oldPosition, newPosition }) {
    if (!message.guild.me.voice.channel) {
      return message.say(pt_br.botnotonchannel);
    }
    if (!message.member.voice.channel) {
      return message.say(pt_br.notonchannel);
    }
    const queueLength = message.guild.musicData.queue.length;
    if (queueLength < 2) {
      return message.say(
        ':x: **Não há música suficientes na fila para executar esse comando**'
      );
    }
    if (
      oldPosition < 1 ||
      oldPosition > queueLength ||
      newPosition < 1 ||
      newPosition > queueLength ||
      newPosition == oldPosition
    ) {
      return message.say(
        ':x: **Você cometeu algum erro ao digitar esse comando**'
      );
    }
    const music = message.guild.musicData.queue.splice(oldPosition - 1, 1)[0];
    message.guild.musicData.queue.splice(newPosition - 1, 0, music);
    return message.say(
      `:white_check_mark: **Movida \`${music.title}\` para a posição ${newPosition}**`
    );
  }
};
