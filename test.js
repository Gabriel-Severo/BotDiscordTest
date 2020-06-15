require('dotenv/config')
const Discord = require('discord.js');
const client = new Discord.Client();
const ping = require('minecraft-server-util');
const fs = require('fs')

async function pingServer() {
    return await ping('codehaunted.aternos.me', 25565);
}

async function getChannel(id){
    return await client.channels.fetch(id).then(channel => {
        return channel
    })
}

function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}

let status, players
async function getStatus(canal){
    try{
        const response = await pingServer()
        if(response.descriptionText.includes('offline') && status !== "offline"){
            status = "offline"
            canal.send(":octagonal_sign: **O servidor foi parado!**")
        }else if(Number(response.maxPlayers)>0 && status !== "iniciado"){
            players = [...response.samplePlayers]
            status = "iniciado"
            canal.send(":white_check_mark: **O servidor iniciou!**")
        }
        console.log(arraysEqual(players,))
        console.log(players)
        console.log(response.samplePlayers)
    }catch(e){}
    getStatus(canal)
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    let id
    try{
        id = JSON.parse(fs.readFileSync('config.json')).id
    }catch(e){
        console.log('Arquivo de config não encontrado')
    }
    if(!id){
        console.log('Id não definido')
        const getId = setInterval(async () => {
            try{
                id = JSON.parse(fs.readFileSync('config.json')).id
            }catch(e){}
            if(id){
                clearInterval(getId)
                const canal = await getChannel(id)
                getStatus(canal)
            }
        }, 1000)
    }else{
        const canal = await getChannel(id)
        getStatus(canal)
    }
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
            }else if(response.descriptionText.includes('preparing')){
                msg.channel.send("O servidor está iniciando")
            }else{
                msg.channel.send("Estado inválido")
                console.log(response)
            }
        }catch(e){
            msg.channel.send("Servidor iniciando")
        }
    }else if(command === 'setchannel'){
        const id = args[0].replace('<#', '').replace('>', '')
        fs.writeFileSync('config.json', JSON.stringify({id}))
    }else if(command == 'onlines'){
        const response = await pingServer()
        const players = response.samplePlayers.reduce((reducer, value, index) => {
            return reducer += (index + 1 != response.samplePlayers.length  ? `${value.name}, ` : `${value.name}`)
        }, '')
        msg.channel.send(players)
    }
});

client.login(process.env.login);