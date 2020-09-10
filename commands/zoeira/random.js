const { Command } = require('discord.js-commando');
module.exports = class RandomCommand extends Command {
  constructor(cliente) {
    super(cliente, {
      name: 'random',
      group: 'zoeira',
      memberName: 'random',
      description: 'Random message'
    });
  }
  run(message) {
    const random1 = ['Anthou', 'Gabriel', 'Ranzo'];
    const random2 = [
      'comprou',
      'matou',
      'decidiu comprar',
      'lambeu',
      'jogou com',
      'construiu',
      'matou',
      'foi para a cama com',
      'comeu',
      'ganhou',
      'deu para'
    ];
    const random3 = [
      'uma banana',
      'um homem',
      'uma cadela',
      'um servidor',
      'um computador',
      'uma lata de milho',
      'um chiclete',
      'uma caixa',
      'um modem',
      'um bot',
      'um cu',
      'um piru',
      'uma cabeça de lampada',
      'um otário'
    ];

    message.delete();
    for (let i = 0; i < 5; i++) {
      message.say(
        `${random1[Math.floor(Math.random() * random1.length)]} ${
          random2[Math.floor(Math.random() * random2.length)]
        } ${random3[Math.floor(Math.random() * random3.length)]}`
      );
    }
  }
};
