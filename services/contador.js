module.exports = async function contar(client) {
  try {
    const channel = await client.channels.cache.get('739876600656429178');
    const message = await channel.messages.fetch();
    const mensagem = message.first();
    setInterval(() => {
      const final = new Date(Date.UTC(2020, 10, 29, 16, 0, 0));
      const dia = new Date();
      const diferenca = final - dia;
      const obj = {
        segundos: Math.floor(diferenca / 1000),
        minutos: Math.floor(diferenca / (1000 * 60)),
        horas: Math.floor(diferenca / (1000 * 3600)),
        dias: Math.floor(diferenca / (1000 * 86400)),
        semanas: Math.floor(diferenca / (1000 * 604800)),
        meses: Math.floor(diferenca / (1000 * 2592000))
      };
      mensagem.edit(`=-=-=-=-=-=-=-=-  Tempo restante  -=-=-=-=-=-=-=-=
                                    ${obj.segundos} segundos
                            ${obj.minutos} minutos e ${
        obj.segundos % 60
      } segundos
                        ${obj.horas} horas, ${obj.minutos % 60} minutos e ${
        obj.segundos % 60
      } segundos
                    ${obj.dias} dias, ${obj.horas % 24} horas, ${
        obj.minutos % 60
      } minutos e ${obj.segundos % 60} segundos
                ${obj.semanas} semanas, ${obj.horas % 24} horas, ${
        obj.minutos % 60
      } minutos e ${obj.segundos % 60} segundos
            ${obj.meses} meses, ${Math.floor(obj.dias % 30.5)} dias, ${
        obj.horas % 24
      } horas, ${obj.minutos % 60} minutos e ${obj.segundos % 60} segundos
            `);
    }, 1000);
  } catch (e) {
    console.log(e);
  }
};
