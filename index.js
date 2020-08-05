require('dotenv/config')
const { CommandoClient } = require('discord.js-commando')
const { Structures } = require('discord.js')
const path = require('path')
const contador = require('./services/contador')

Structures.extend('Guild', (Guild) => {
    class MusicGuild extends Guild{
        constructor(client, data){
            super(client, data)
            this.musicData = {
                queue: [],
                isPlaying: false,
                nowPlaying: null,
                songDispatcher: null,
                looping: false,
                volume: 0.05
            }
        }
    }
    return MusicGuild
})

const client = new CommandoClient({
    commandPrefix: process.env.PREFIX,
    owner: '254664533270855680'
})

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['music', 'Comandos de música'],
        ['zoeira', 'Comandos de zoeira']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        eval: true,
        prefix: false,
        commandState: false
    })
    .registerCommandsIn(path.join(__dirname, 'commands'))

client.on('ready', () => {
    console.log(`${client.user.tag} is alive.`)
    contador(client)
})

client.on('voiceStateUpdate', async (___, newState) => {
    if (
        newState.member.user.bot &&
        !newState.channelID &&
        newState.guild.musicData.songDispatcher &&
        newState.member.user.id == client.user.id
    ) {
        newState.guild.musicData.queue.length = 0;
        newState.guild.musicData.songDispatcher.end();
        return;
    }
    if (
        newState.member.user.bot &&
        newState.channelID &&
        newState.member.user.id == client.user.id &&
        !newState.selfDeaf
    ) {
         newState.setSelfDeaf(true);
    }
});

client.login(process.env.TOKEN)