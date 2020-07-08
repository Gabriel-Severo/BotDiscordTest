require('dotenv/config')
const Discord = require('discord.js')
const client = new Discord.Client()
const commands = require('./commands')

client.on('ready', () => {
    console.log(`${client.user.tag} is alive`)
})

client.on('message', msg => {
    commands(msg)
})

client.login(process.env.TOKEN)