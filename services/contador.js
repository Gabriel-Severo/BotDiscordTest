const db = require('../config/database');
class Contador {
  constructor(date) {
    this.date = date;
    this.time = date - new Date();
  }
  calculateTime() {
    this.time -= 5000;
  }
  getSeconds() {
    return Math.floor(this.time / 1000) < 0 ? 0 : Math.floor(this.time / 1000)
  }
  getMinutes() {
    return Math.floor(this.time / (1000 * 60)) < 0 ? 0 : Math.floor(this.time / (1000 * 60))
  }
  getHours() {
    return Math.floor(this.time / (1000 * 3600)) < 0 ? 0 : Math.floor(this.time / (1000 * 3600))
  }
  getDays() {
    return Math.floor(this.time / (1000 * 86400)) < 0 ? 0 : Math.floor(this.time / (1000 * 86400))
  }
  getWeeks() {
    return Math.floor(this.time / (1000 * 604800)) < 0 ? 0 : Math.floor(this.time / (1000 * 604800))
  }
  getMonths() {
    return Math.floor(this.time / (1000 * 2628000)) < 0 ? 0 : Math.floor(this.time / (1000 * 2628000))
  }
}

async function contar(client) {
  db.query('SELECT * FROM contador').then(async (rows) => {
    for (let row of rows.rows) {
      let channel, message, mensagem;
      try {
        channel = await client.channels.cache.get(row.canal_id);
        message = await channel.messages.fetch();
        mensagem = await message.get(row.mensagem_id);
      } catch (e) {
        db.query('DELETE FROM contador WHERE id = $1', [row.id]);
      }

      if(!mensagem){
        return db.query('DELETE FROM contador WHERE id = $1', [row.id]);
      }

      const contador = new Contador(
        new Date(
          Date.UTC(
            row.ano,
            row.mes-1,
            row.dia,
            row.horas,
            row.minutos,
            0
          )
        )
      );

      setInterval(async () => {
        contador.calculateTime();
        mensagem.edit(`=-=-=-=-=-=-=-=-  Tempo restante  -=-=-=-=-=-=-=-=
        \t\t\t\t\t\t\t\t${contador.getSeconds()} segundos
        \t\t\t\t\t\t${contador.getMinutes()} minutos e ${
          contador.getSeconds() % 60
        } segundos
        \t\t\t\t\t${contador.getHours()} horas, ${
          contador.getMinutes() % 60
        } minutos e ${contador.getSeconds() % 60} segundos
        \t\t\t\t${contador.getDays()} dias, ${
          contador.getHours() % 24
        } horas, ${contador.getMinutes() % 60} minutos e ${
          contador.getSeconds() % 60
        } segundos
        \t\t\t${contador.getWeeks()} semanas, ${
          contador.getHours() % 24
        } horas, ${contador.getMinutes() % 60} minutos e ${
          contador.getSeconds() % 60
        } segundos
        \t\t${contador.getMonths()} meses, ${Math.floor(
          contador.getDays() % 30.5
        )} dias, ${contador.getHours() % 24} horas, ${
          contador.getMinutes() % 60
        } minutos e ${contador.getSeconds() % 60} segundos
              `);
      }, 5000);
    }
  });
}

module.exports = {
  contar,
  Contador
};
