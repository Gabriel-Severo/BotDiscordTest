const util = require('minecraft-server-util');
function getPlayers(response) {
  return (
    (response.samplePlayers &&
      response.samplePlayers.map((player) => player.name)) ||
    []
  );
}
function arraysEqual(a1, a2) {
  return JSON.stringify(a1) == JSON.stringify(a2);
}
module.exports = async function minecraft(client) {
  let status, players, channel;
  channel = await client.channels.cache.get('750716262107054250');
  for (;;) {
    await util
      .status('greenteaparty.mcnetwork.me', { port: 25565 })
      .then((response) => {
        if (status !== 'online') {
          channel.send('**:white_check_mark: O servidor iniciou!**');
          channel.send(`**IP: ${response.host}**`);
          status = 'online';
          players = [...getPlayers(response)];
        }
        const atual = getPlayers(response);
        let connected = [];
        let disconnected = [];
        if (!arraysEqual(players, atual)) {
          connected = atual.filter((player) => {
            return !players.includes(player);
          });
          disconnected = players.filter((player) => {
            return !atual.includes(player);
          });
          players = getPlayers(response);
        }
        connected.forEach((player) => {
          channel.send(`**${player} conectou ao servidor**`);
        });
        disconnected.forEach((player) => {
          channel.send(`**${player} desconectou do servidor**`);
        });
      })
      .catch(() => {
        if (status !== 'offline') {
          channel.send('**:octagonal_sign: O servidor foi parado!**');
          status = 'offline';
        }
      });
  }
};
