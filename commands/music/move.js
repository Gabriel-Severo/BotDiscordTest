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
      return message.say(pt_br.notenoughmusic);
    }
    if (
      oldPosition < 1 ||
      oldPosition > queueLength ||
      newPosition < 1 ||
      newPosition > queueLength ||
      newPosition == oldPosition
    ) {
      return message.say(pt_br.invalidposition);
    }
    const music = message.guild.musicData.queue.splice(oldPosition - 1, 1)[0];
    message.guild.musicData.queue.splice(newPosition - 1, 0, music);
    return message.say(
      pt_br.movedmusic.replace('{0}', music.title).replace('{1}', newPosition)
    );
  }
};
