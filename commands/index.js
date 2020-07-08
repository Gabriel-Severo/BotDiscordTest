const music = require('./music/music')

module.exports = (msg) => {
    if(msg.author.bot) return;
    if(!msg.content.startsWith('!')) return;
    const args = msg.content.slice(1).trim().split(/ +/g)
    const commands = args.shift().toLowerCase()

    if (commands === 'teste'){
        music.play()
    }
}