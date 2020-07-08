const ytdl = require("ytdl-core")
async function teste(){
    const info = await ytdl("https://www.youtube.com/watch?v=kknKs7cAcO8")
    console.log(info.destroyed)
}

teste()