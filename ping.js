const ping = require('minecraft-server-util');

async function teste() {
    return await ping('codehaunted.aternos.me', 25565);
}

async function teste2(){
    while(true){
        console.log(await teste())
    }
}

teste2()