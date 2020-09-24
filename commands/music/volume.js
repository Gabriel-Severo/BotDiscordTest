const { Command } = require('discord.js-commando');
const pt_br = require('../../language/pt_br.json');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      group: 'music',
      memberName: 'volume',
      description: 'Seta um volume para a música',
      args: [
        {
          key: 'wantedVolume',
          prompt: 'Qual o volume você gostaria de setar',
          type: 'integer'
        }
      ]
    });
  }
  run(message, { wantedVolume }) {
    if (!message.guild.me.voice.channel) {
      return message.say(pt_br.botnotonchannel);
    }
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.say(pt_br.notonchannel);
    }
    if (
      message.guild.musicData.songDispatcher == null ||
      typeof message.guild.musicData.songDispatcher == 'undefined'
    ) {
      return message.say(pt_br.nomusicplaying);
    }
    if (wantedVolume < 0 || wantedVolume > 200) {
      return message.say(':x: **O volume informado é inválido**');
    }
    let volume = 0;
    if (!wantedVolume == 0) {
      volume = wantedVolume / 100;
    }
    message.guild.musicData.volume = volume;
    message.guild.musicData.songDispatcher.setVolume(volume);
    message.say(
      `:white_check_mark: **O volume foi setado para ${wantedVolume}%**`
    );
  }
};
