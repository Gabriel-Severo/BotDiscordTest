const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      group: 'music',
      memberName: 'join',
      description: 'Entra no canal'
    });
  }
  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }
    message.say(
      pt_br.joinchannel
        .replace('{0}', voiceChannel.parent.name)
        .replace('{1}', voiceChannel.name)
    );

    message.member.voice.channel.join();
  }
};
