require('dotenv/config')
const Discord = require('discord.js');
const client = new Discord.Client();
const ping = require('minecraft-server-util');
const fs = require('fs')
const ytdl = require('ytdl-core')
const readline = require('readline')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

function getPlayers(response){
    return response.samplePlayers && response.samplePlayers.map(player => player.name) || []
}

let status, players
async function getStatus(canal){
    try{
        const response = await pingServer()
        if(response.descriptionText.includes('offline') && status !== "offline"){
            status = "offline"
            canal.send(":octagonal_sign: **O servidor foi parado!**")
        }else if(Number(response.maxPlayers)>0 && status !== "iniciado"){
            players = [...getPlayers(response)]
            status = "iniciado"
            canal.send(":white_check_mark: **O servidor iniciou!**")
            canal.send(`**IP: ${response.host}:${response.port}**`)
        }
        if(Number(response.maxPlayers)>0){
            const atual = getPlayers(response)
            let connected = []
            let disconnected = []
            if(!arraysEqual(players, atual)){
                connected = atual.filter(player => {
                    return !players.includes(player)
                })
                disconnected = players.filter(player => {
                    return !atual.includes(player)
                })
                players = [...getPlayers(response)]
            }
            connected.forEach(player => {
                canal.send(`**${player} conectou ao servidor**`)
            })
            disconnected.forEach(player => {
                canal.send(`**${player} desconectou do servidor**`)
            })
        }
        
    }catch(e){
        //console.log(e)
    }
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

let dispatcher;

client.on('message', async msg => {
    if(msg.author.bot) return;
    if(!msg.content.startsWith(process.env.prefix)) return;
    const args = msg.content.slice(process.env.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === 'status') {
        try{
            const response = await pingServer()
            if(response.descriptionText.includes('queue')){
                const time = response.descriptionText.split('§aca. ')[1].split(' minutes§8.')[0]
                msg.channel.send(`O servidor está em fila e iniciará em ${time} minutos`)
            }else if(response.descriptionText.includes('offline')){
                msg.channel.send("O servidor está offline")
            }else if(Number(response.maxPlayers)>0){
                msg.channel.send("Servidor online")
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
        if(msg.member.hasPermission('ADMINISTRATOR')){
            const id = args[0].replace('<#', '').replace('>', '')
            fs.writeFileSync('config.json', JSON.stringify({id}))
        }else{
            msg.channel.send("Você não tem permissão para utilizar esse comando")
        }
    }else if(command == 'online'){
        const response = await pingServer()
        if(Number(response.maxPlayers)>0){
            const players = response.samplePlayers.reduce((reducer, value, index) => {
                return reducer += (index + 1 != response.samplePlayers.length  ? `${value.name}, ` : `${value.name}`)
            }, '')
            const quantidade = response.samplePlayers.length
            msg.channel.send(quantidade > 1 ? `Jogadores(${quantidade}): ${players}` : `Jogador(1): ${players}`)
        }else{
            msg.channel.send("Servidor offline")
        }
    }else if(command == 'join'){
        if(!msg.member.voice.channel){
            msg.channel.send("Você precisa estar em um canal")
        }
        const connection = await msg.member.voice.channel.join()
        dispatcher = connection.play(ytdl("https://www.youtube.com/watch?v=kknKs7cAcO8"))
        dispatcher.on('start', () => {
            console.log('audio.mp3 is now playing!');
        });
        dispatcher.

        dispatcher.on('finish', () => {
            console.log('audio.mp3 has finished playing!');
        });
    }else if(command == 'teste'){
        console.log(dispatcher.streamTime)
        console.log(dispatcher.totalStreamTime)
        console.log(dispatcher.listenerCount())
        //console.log(dispatcher.player)
    }else if(command == 'o'){
        while(true){
            await new Promise((resolve, reject) => {
                rl.question("Frase: ", async(mensagem) => {
                    console.log(mensagem)
                    await msg.channel.send(mensagem)
                    if(mensagem !== ""){
                        resolve()
                    }
                })
            })
        }
    }
});

client.login(process.env.login);