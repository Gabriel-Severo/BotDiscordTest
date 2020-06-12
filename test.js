require('dotenv/config')
const Discord = require('discord.js');
const client = new Discord.Client();
const ping = require('minecraft-server-util');

async function teste() {
    return await ping('codehaunted.aternos.me', 25565);
}

let canal

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setInterval(async() => {
        if(canal){
            const response = await teste()
            if(response.descriptionText.includes('queue')){
                const time = response.descriptionText.split('§aca. ')[1].split(' minutes§8.')[0]
                canal.send(`O servidor está em fila e iniciará em ${time} minutos`)
            }else if(response.descriptionText.includes('offline')){
                canal.send("O servidor está offline")
            }else{
                canal.send("Servidor iniciado")
            }
        }
    }, 1000)
});

client.on('message', async msg => {
    if(msg.author.bot) return;
    if(!msg.content.startsWith(process.env.prefix)) return;
    const args = msg.content.slice(process.env.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === 'online') {
        const response = await teste()
        if(response.descriptionText.includes('queue')){
            const time = response.descriptionText.split('§aca. ')[1].split(' minutes§8.')[0]
            msg.channel.send(`O servidor está em fila e iniciará em ${time} minutos`)
        }else if(response.descriptionText.includes('offline')){
            msg.channel.send("O servidor está offline")
        }else{
            msg.channel.send("Servidor iniciado")
        }
        console.log(response)
    }else if(command === 'setchannel'){
        id = args[0].replace('<#', '').replace('>', '')
        await client.channels.fetch(id).then(channel => {
            canal = channel
        })
    }
});

client.login(process.env.login);