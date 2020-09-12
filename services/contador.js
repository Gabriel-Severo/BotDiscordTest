class Contador {
  constructor(data) {
    this.data = data;
  }
  getTime() {
    const date = new Date(Date.UTC(2020, 10, 29, 16, 0, 0));
    const dateToday = new Date();
    const diferenca = date - dateToday;
    return {
      segundos: Math.floor(diferenca / 1000),
      minutos: Math.floor(diferenca / (1000 * 60)),
      horas: Math.floor(diferenca / (1000 * 3600)),
      dias: Math.floor(diferenca / (1000 * 86400)),
      semanas: Math.floor(diferenca / (1000 * 604800)),
      meses: Math.floor(diferenca / (1000 * 2592000))
    };
  }
}

module.exports = async function contar(client) {
  try {
    const channel = await client.channels.cache.get('739876600656429178');
    const message = await channel.messages.fetch();
    const mensagem = message.get('741444453427839006');
    const contador = new Contador(new Date(Date.UTC(2020, 10, 29, 16, 0, 0)));
    for (;;) {
      mensagem.edit(`=-=-=-=-=-=-=-=-  Tempo restante  -=-=-=-=-=-=-=-=
                                    ${contador.getTime().segundos} segundos
                            ${contador.getTime().minutos} minutos e ${
        contador.getTime().segundos % 60
      } segundos
                        ${contador.getTime().horas} horas, ${
        contador.getTime().minutos % 60
      } minutos e ${contador.getTime().segundos % 60} segundos
                    ${contador.getTime().dias} dias, ${
        contador.getTime().horas % 24
      } horas, ${contador.getTime().minutos % 60} minutos e ${
        contador.getTime().segundos % 60
      } segundos
                ${contador.getTime().semanas} semanas, ${
        contador.getTime().horas % 24
      } horas, ${contador.getTime().minutos % 60} minutos e ${
        contador.getTime().segundos % 60
      } segundos
            ${contador.getTime().meses} meses, ${Math.floor(
        contador.getTime().dias % 30.5
      )} dias, ${contador.getTime().horas % 24} horas, ${
        contador.getTime().minutos % 60
      } minutos e ${contador.getTime().segundos % 60} segundos
            `);
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    }
  } catch (e) {
    console.log(e);
  }
};
