const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class RemoveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      group: 'music',
      memberName: 'remove',
      description: 'Remove uma música da fila',
      args: [
        {
          key: 'songNumber',
          prompt: 'Qual múica você gostaria de remover',
          type: 'integer'
        }
      ]
    });
  }
  run(message, { songNumber }) {
    if (!message.guild.me.voice.channel) {
      return message.say(pt_br.botnotonchannel);
    }
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }
    if (songNumber < 1 || songNumber > message.guild.musicData.queue.length) {
      return message.say(pt_br.musicdoesnotexist);
    }
    const removed = message.guild.musicData.queue.splice(songNumber - 1, 1)[0];
    return message.say(pt_br.successfullyremoved.replace('{0}', removed.title));
  }
};
