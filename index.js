require('dotenv/config')
const { CommandoClient } = require('discord.js-commando')
const { Structures } = require('discord.js')
const path = require('path')
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
    console.log(`${client.user.tag} is alive`)
})

client.login(process.env.TOKEN)