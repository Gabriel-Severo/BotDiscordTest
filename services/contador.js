class Contador {
  constructor(date) {
    this.date = date;
    this.time = date - new Date();
  }
  calculateTime() {
    this.time -= 3000;
  }
  getSeconds() {
    return Math.floor(this.time / 1000);
  }
  getMinutes() {
    return Math.floor(this.time / (1000 * 60));
  }
  getHours() {
    return Math.floor(this.time / (1000 * 3600));
  }
  getDays() {
    return Math.floor(this.time / (1000 * 86400));
  }
  getWeeks() {
    return Math.floor(this.time / (1000 * 604800));
  }
  getMonths() {
    return Math.floor(this.time / (1000 * 2592000));
  }
}

module.exports = function contar(client) {
  const contador = new Contador(new Date(Date.UTC(2020, 10, 29, 16, 0, 0)));

  setInterval(() => {
    contador.calculateTime();
    client.channels.cache
      .get('754322882506653756')
      .messages.fetch()
      .then((message) => {
        message.get('754323027780567091')
          .edit(`=-=-=-=-=-=-=-=-  Tempo restante  -=-=-=-=-=-=-=-=
      \t\t\t\t\t\t\t\t${contador.getSeconds()} segundos
      \t\t\t\t\t\t${contador.getMinutes()} minutos e ${
          contador.getSeconds() % 60
        } segundos
      \t\t\t\t\t${contador.getHours()} horas, ${
          contador.getMinutes() % 60
        } minutos e ${contador.getSeconds() % 60} segundos
      \t\t\t\t${contador.getDays()} dias, ${contador.getHours() % 24} horas, ${
          contador.getMinutes() % 60
        } minutos e ${contador.getSeconds() % 60} segundos
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
      });
  }, 3000);
};
