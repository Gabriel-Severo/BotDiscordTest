const Discord = require('discord.js');
const client = new Discord.Client();
const ping = require('minecraft-server-util');

async function teste() {
    return await ping('codehaunted.aternos.me', 25565);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if(msg.author.bot) return;
    if (msg.content === '!online') {
        const response = await teste()
        if(response.descriptionText.includes('queue')){
            const time = response.descriptionText.split('§aca. ')[1].split(' minutes§8.')[0]
            const message = await msg.channel.send(`O servidor está em fila e iniciará em ${time} minutos`)
        }else if(response.descriptionText.includes('offline')){
            msg.reply("O servidor está offline")
        }
    }else if(msg.content === "!test") {
        console.log(client.guilds)
    }
});

client.login('NzE2NzI2MzcwOTMxMTc5NjIx.XtP9lQ.dd7jHngKjwRPMstxkFijYwSOfTE');