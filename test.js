require('dotenv/config')
const Discord = require('discord.js');
const client = new Discord.Client();
const ping = require('minecraft-server-util');

async function pingServer() {
    return await ping('codehaunted.aternos.me', 25565);
}

let id, canal, status

async function setChannel(id){
    return await client.channels.fetch(id).then(channel => {
        return channel
    })
}

async function getStatus(canal){
    const response = await pingServer()
    try{
        if(response.descriptionText.includes('offline') && status !== "offline"){
            status = "offline"
            canal.send("O servidor está offline")
        }else if(Number(response.maxPlayers)>0 && status !== "iniciado"){
            status = "iniciado"
            canal.send("Servidor iniciado")
        }
    }catch(e){
        if(status !== "iniciando"){
            canal.send("O servidor está iniciando")
        }
        status = "iniciando"
    }
    getStatus(canal)
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const setchannel = setInterval(async () => {
        if(id){
            canal = await setChannel(id)
            clearInterval(setchannel)
            getStatus(canal)
        }
    }, 1000)
});

client.on('message', async msg => {
    if(msg.author.bot) return;
    if(!msg.content.startsWith(process.env.prefix)) return;
    const args = msg.content.slice(process.env.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === 'online') {
        try{
            const response = await pingServer()
            if(response.descriptionText.includes('queue')){
                const time = response.descriptionText.split('§aca. ')[1].split(' minutes§8.')[0]
                msg.channel.send(`O servidor está em fila e iniciará em ${time} minutos`)
            }else if(response.descriptionText.includes('offline')){
                msg.channel.send("O servidor está offline")
            }else if(Number(response.maxPlayers)>0){
                msg.channel.send("Servidor iniciado")
            }else{
                msg.channel.send("Estado inválido")
                console.log(response)
            }
        }catch(e){
            msg.channel.send("Servidor iniciando")
        }
    }else if(command === 'setchannel'){
        id = args[0].replace('<#', '').replace('>', '')
    }
});

client.login(process.env.login);