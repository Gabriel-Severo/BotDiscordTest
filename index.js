const { prefix, token } = require('./config.json');
const { CommandoClient } = require('discord.js-commando');
const { Structures } = require('discord.js');
const path = require('path');
//const contador = require('./services/contador');

Structures.extend('Guild', (Guild) => {
  class MusicGuild extends Guild {
    constructor(client, data) {
      super(client, data);
      this.musicData = {
        queue: [],
        isPlaying: false,
        nowPlaying: null,
        songDispatcher: null,
        looping: false,
        volume: 0.5,
        repeat: false,
        repeated: false
      };
    }
  }
  return MusicGuild;
});

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: '254664533270855680'
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['music', 'Comandos de música'],
    ['zoeira', 'Comandos de zoeira']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    eval: false,
    prefix: false,
    commandState: false,
    unknownCommand: false,
    help: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
  console.log(`${client.user.tag}`);
  //contador(client);
});

//client.on('debug', console.log);
client.login(token);
