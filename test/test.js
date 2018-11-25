var should = require('should');
var Game = require('../baccaratsolver').Game;
var Card = require('../baccaratsolver').Card;

describe('Card setup', function() {
  it('should generate a proper card with an appropriate point value', function() {
    var card = new Card('3s');
    card.value.should.equal('3');
    card.suit.should.equal('s');
    card.points.should.equal(3);
    card.toString().should.equal('3s');
  });
  it('should generate an Ace properly', function() {
    var card = new Card('Ac');
    card.value.should.equal('A');
    card.suit.should.equal('c');
    card.points.should.equal(1);
    card.toString().should.equal('Ac');
  });
  it('should generate a Ten properly', function() {
    var card = new Card('Td');
    card.value.should.equal('T');
    card.suit.should.equal('d');
    card.points.should.equal(0);
    card.toString().should.equal('10d');
  });
  it('should error on a bad rank', function() {
    var card;
    try {
      card = new Card('1d');
    } catch(e) {
      e.name.should.equal('InvalidCardError');
      e.message.should.equal('Rank Invalid');
    }
    should.not.exist(card);
  });
  it('should error on a bad suit', function() {
    var card;
    try {
      card = new Card('2t');
    } catch(e) {
      e.name.should.equal('InvalidCardError');
      e.message.should.equal('Suit Invalid');
    }
    should.not.exist(card);
  });
});
describe('Card drawing an misdealing', function() {
  it('should return an error with no cards', function() {
    var game = new Game();
    try {
      game.playGame();
    } catch(e) {
      e.name.should.equal('NoMoreCardsError');
      e.message.should.equal('Not enough cards. Misdeal.');
    }
    game.winner.should.equal(false);
  });
  it('should be OK despite not enough cards because of rules', function() {
    var game = new Game(['Js', '5d', '9h', '3c']);
    var output = game.playGame();
    output.should.equal('Player, Natural 9 over 8');
    game.playerPoints.should.equal(9);
    game.bankerPoints.should.equal(8);
    game.winner.should.equal('Player');
    game.natural.should.equal(true);
    game.descr.should.equal(output);
  });
  it('should also be OK if Card objects are used', function() {
    var game = new Game([new Card('Js'), new Card('5d'), new Card('9h'), new Card('3c')]);
    var output = game.playGame();
    output.should.equal('Player, Natural 9 over 8');
    game.playerPoints.should.equal(9);
    game.bankerPoints.should.equal(8);
    game.winner.should.equal('Player');
    game.natural.should.equal(true);
    game.descr.should.equal(output);
  });
  it('should error if no cards are left for a draw', function() {
    var game = new Game(['Js', '2d', '5h', '3c']);
    try {
      var output = game.playGame();
    } catch(e) {
      e.name.should.equal('NoMoreCardsError');
      e.message.should.equal('Not enough cards. Misdeal.');
    }
    should.not.exist(output);
    game.playerPoints.should.equal(5);
    game.bankerPoints.should.equal(5);
    game.winner.should.equal(false);
    game.natural.should.equal(false);
    game.descr.should.equal('');
  });
});

describe('Natural hands', function() {
  it('should be declared if player is at 8', function() {
    var game = new Game(['Js', 'Td', '8h', 'Ac', '3c', '7h']);
    var output = game.playGame();
    output.should.equal('Player, Natural 8 over 1');
    game.playerPoints.should.equal(8);
    game.bankerPoints.should.equal(1);
    game.winner.should.equal('Player');
    game.natural.should.equal(true);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(2);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('8h');
    game.bankerCards.length.should.equal(2);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('Ac');
  });
  it('should be declared if banker is at 8', function() {
    var game = new Game(['Ac', 'Js', 'Td', '8h', '3c', '7h']);
    var output = game.playGame();
    output.should.equal('Banker, Natural 8 over 1');
    game.playerPoints.should.equal(1);
    game.bankerPoints.should.equal(8);
    game.winner.should.equal('Banker');
    game.natural.should.equal(true);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(2);
    game.bankerCards.length.should.equal(2);
  });
  it('should be declared if both players are at 9', function() {
    var game = new Game(['Ac', 'Js', '8d', '9h', '3c', '7h']);
    var output = game.playGame();
    output.should.equal('Tie, Natural 9');
    game.playerPoints.should.equal(9);
    game.bankerPoints.should.equal(9);
    game.winner.should.equal('Tie');
    game.natural.should.equal(true);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(2);
    game.bankerCards.length.should.equal(2);
  });
  it('should not be declared if neither reaches at least 8, even on 3rd card', function() {
    var game = new Game(['Ac', 'Js', '3d', 'Ah', '4d', '6h']);
    var output = game.playGame();
    output.should.equal('Player, 8 over 7');
    game.playerPoints.should.equal(8);
    game.bankerPoints.should.equal(7);
    game.winner.should.equal('Player');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.bankerCards.length.should.equal(3);
  });
});

describe('Other hands', function() {
  it('should stand when both are at 6 or 7', function() {
    var game = new Game(['Js', 'Td', '6h', '7c', '3c', '7h']);
    var output = game.playGame();
    output.should.equal('Banker, 7 over 6');
    game.playerPoints.should.equal(6);
    game.bankerPoints.should.equal(7);
    game.winner.should.equal('Banker');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(2);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('6h');
    game.bankerCards.length.should.equal(2);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('7c');
  });
  it('should only draw when needed, without skipping in the pool', function() {
    var game = new Game(['Js', 'Td', '6h', '5c', '3c', '7h']);
    var output = game.playGame();
    output.should.equal('Banker, 8 over 6');
    game.playerPoints.should.equal(6);
    game.bankerPoints.should.equal(8);
    game.winner.should.equal('Banker');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(2);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('6h');
    game.bankerCards.length.should.equal(3);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('5c');
    game.bankerCards[2].toString().should.equal('3c');
  });
  it('should draw on banker 0-2', function() {
    var game = new Game(['Js', 'Td', '3h', '2c', '3c', '7h']);
    var output = game.playGame();
    output.should.equal('Banker, 9 over 6');
    game.playerPoints.should.equal(6);
    game.bankerPoints.should.equal(9);
    game.winner.should.equal('Banker');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('3h');
    game.playerCards[2].toString().should.equal('3c');
    game.bankerCards.length.should.equal(3);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('2c');
    game.bankerCards[2].toString().should.equal('7h');
  });
  it('should draw on banker 3', function() {
    var game = new Game(['Js', 'Td', '3h', '3c', '4c', '7h']);
    var output = game.playGame();
    output.should.equal('Player, 7 over 0');
    game.playerPoints.should.equal(7);
    game.bankerPoints.should.equal(0);
    game.winner.should.equal('Player');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('3h');
    game.playerCards[2].toString().should.equal('4c');
    game.bankerCards.length.should.equal(3);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('3c');
    game.bankerCards[2].toString().should.equal('7h');
  });
  it('should stand on banker 3', function() {
    var game = new Game(['Js', 'Td', '5h', '3c', '8c', '7h']);
    var output = game.playGame();
    output.should.equal('Tie, 3');
    game.playerPoints.should.equal(3);
    game.bankerPoints.should.equal(3);
    game.winner.should.equal('Tie');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('5h');
    game.playerCards[2].toString().should.equal('8c');
    game.bankerCards.length.should.equal(2);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('3c');
  });
  it('should draw on banker 4', function() {
    var game = new Game(['Js', 'Td', '3h', '4c', '2c', '7h']);
    var output = game.playGame();
    output.should.equal('Player, 5 over 1');
    game.playerPoints.should.equal(5);
    game.bankerPoints.should.equal(1);
    game.winner.should.equal('Player');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('3h');
    game.playerCards[2].toString().should.equal('2c');
    game.bankerCards.length.should.equal(3);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('4c');
    game.bankerCards[2].toString().should.equal('7h');
  });
  it('should stand on banker 4', function() {
    var game = new Game(['Js', 'Td', '5h', '4c', 'Ac', '7h']);
    var output = game.playGame();
    output.should.equal('Player, 6 over 4');
    game.playerPoints.should.equal(6);
    game.bankerPoints.should.equal(4);
    game.winner.should.equal('Player');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('5h');
    game.playerCards[2].toString().should.equal('Ac');
    game.bankerCards.length.should.equal(2);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('4c');
  });
  it('should draw on banker 5', function() {
    var game = new Game(['Js', 'Td', '3h', '5c', '4c', '7h']);
    var output = game.playGame();
    output.should.equal('Player, 7 over 2');
    game.playerPoints.should.equal(7);
    game.bankerPoints.should.equal(2);
    game.winner.should.equal('Player');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('3h');
    game.playerCards[2].toString().should.equal('4c');
    game.bankerCards.length.should.equal(3);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('5c');
    game.bankerCards[2].toString().should.equal('7h');
  });
  it('should stand on banker 5', function() {
    var game = new Game(['Js', 'Td', '5h', '5c', '3c', '7h']);
    var output = game.playGame();
    output.should.equal('Player, 8 over 5');
    game.playerPoints.should.equal(8);
    game.bankerPoints.should.equal(5);
    game.winner.should.equal('Player');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('5h');
    game.playerCards[2].toString().should.equal('3c');
    game.bankerCards.length.should.equal(2);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('5c');
  });
  it('should draw on banker 6', function() {
    var game = new Game(['Js', 'Td', '3h', '6c', '7c', '7h']);
    var output = game.playGame();
    output.should.equal('Banker, 3 over 0');
    game.playerPoints.should.equal(0);
    game.bankerPoints.should.equal(3);
    game.winner.should.equal('Banker');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('3h');
    game.playerCards[2].toString().should.equal('7c');
    game.bankerCards.length.should.equal(3);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('6c');
    game.bankerCards[2].toString().should.equal('7h');
  });
  it('should stand on banker 6', function() {
    var game = new Game(['Js', 'Td', '5h', '6c', '5c', '7h']);
    var output = game.playGame();
    output.should.equal('Banker, 6 over 0');
    game.playerPoints.should.equal(0);
    game.bankerPoints.should.equal(6);
    game.winner.should.equal('Banker');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('5h');
    game.playerCards[2].toString().should.equal('5c');
    game.bankerCards.length.should.equal(2);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('6c');
  });
  it('should stand on banker 7', function() {
    var game = new Game(['Js', 'Td', '5h', '7c', '7d', '7h']);
    var output = game.playGame();
    output.should.equal('Banker, 7 over 2');
    game.playerPoints.should.equal(2);
    game.bankerPoints.should.equal(7);
    game.winner.should.equal('Banker');
    game.natural.should.equal(false);
    game.descr.should.equal(output);
    game.playerCards.length.should.equal(3);
    game.playerCards[0].toString().should.equal('Js');
    game.playerCards[1].toString().should.equal('5h');
    game.playerCards[2].toString().should.equal('7d');
    game.bankerCards.length.should.equal(2);
    game.bankerCards[0].toString().should.equal('10d');
    game.bankerCards[1].toString().should.equal('7c');
  });
});
