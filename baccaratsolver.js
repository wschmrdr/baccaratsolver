/**
 * baccaratsolver v0.1
 * Copyright (c) 2018, wschmrdr
 */

(function() {
  'use strict';

  // NOTE: No jokers are used in this game, and each card has a specific value.
  var values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  var suits = ['c', 'd', 'h', 's'];

  // Throw this error when an invalid card is input.
  function InvalidCardError(message) {
    this.name = 'InvalidCardError';
    this.message = (message || "Invalid Card");
  }
  InvalidCardError.prototype = Error.prototype;

  // Throw this error when no more cards remain to be dealt.
  function NoMoreCardsError(message) {
    this.name = 'NoMoreCardsError';
    this.message = (message || "Not enough cards. Misdeal.");
  }
  NoMoreCardsError.prototype = Error.prototype;

  /**
   * Base Card class that defines a single card.
   */
  class Card {
    constructor(str) {
      this.value = str.substr(0, 1);
      if (values.indexOf(this.value) < 0) {
        throw new InvalidCardError('Rank Invalid');
      }
      this.suit = str.substr(1, 1).toLowerCase();
      if (suits.indexOf(this.suit) < 0) {
        throw new InvalidCardError('Suit Invalid');
      }
      this.points = 0;

      // The "points" is used to determine how many points a card is worth.
      // All tens and face cards have a point value of 0.
      if (str.substr(0, 1) === 'A') {
        // All Aces in this game have a point value of 1.
        this.points = 1;
      } else if (parseInt(str.substr(0, 1))) {
        // The 2-9 cards in this game have a point value of the number on the card.
        // It is important to represent "T" for 10 here, as this has a different point value.
        this.points = parseInt(str.substr(0, 1));
      }
    }

    toString() {
      return this.value.replace('T', '10') + this.suit;
    }

  }

  /**
   * Base Game class that defines the flow of the game.
   * The methods dealCard and log are likely candidates for override when extending this class.
   */
  class Game {
    constructor(cards) {
      // Card Data and Pool Counter
      this.cardPool = [];
      this.cardPoolCount = 0;
      this.playerCards = [];
      this.bankerCards = [];

      // Output Information
      this.playerPoints = 0;
      this.bankerPoints = 0;
      this.winner = false;
      this.natural = false;
      this.descr = '';

      // It is possible that the server may wish to pass a subset of a deck of cards.
      // If so, place them into the deck. Order matters.
      if (cards) {
        this.cardPool = cards.map(function(c) {
          return (typeof c === 'string') ? new Card(c) : c;
        });
      }
    }


    /**
     * Walk through an entire game to find a winner.
     * @return {String} The declared winner description.
     */
    playGame() {
      // Deal four cards, and get the running totals. Indices 0 and 2 to Player, 1 and 3 to Banker.
      // This is done iteratively in case dealCard is overridden.
      this.playerCards.push(this.dealCard());
      this.bankerCards.push(this.dealCard());
      this.playerCards.push(this.dealCard());
      this.bankerCards.push(this.dealCard());
      this.playerPoints = Game.getTotalPoints(this.playerCards);
      this.bankerPoints = Game.getTotalPoints(this.bankerCards);
      Game.log('Player shows ' + this.playerPoints);
      Game.log('Banker has ' + this.bankerPoints);
      
      // Check for natural. If Player OR Banker has 8 or 9, the game is over. Declare a winner.
      if (this.playerPoints >= 8 || this.bankerPoints >= 8) {
        this.natural = true;
        Game.log('Natural hand');
        return this.declareWinner();
      }

      // Check Player score. If it is 0-5, it will draw. Otherwise, it will stand.
      var thirdCard = false;
      if (Game.shouldDraw(this.playerPoints, -1)) {
        Game.log('Player draws');
        thirdCard = this.dealCard();
        this.playerCards.push(thirdCard);
      } else {
        Game.log('Player stands');
      }

      // Check for if the Banker should draw. This is dependent on the Player's third card.
      if (Game.shouldDraw(this.bankerPoints, (thirdCard ? thirdCard.points : -1))) {
        Game.log('Banker draws');
        this.bankerCards.push(this.dealCard());
      } else {
        Game.log('Banker stands');
      }

      // Finally, compare the two hands and declare a winner.
      return this.declareWinner();
    }

    /**
     * Deal a single card, returning the card to be added.
     * This method should be overridden for single card dealing if a shoe setup is desired.
     * @return {Card} The card dealt.
     */
    dealCard() {
      if (this.cardPoolCount === this.cardPool.length) {
        throw new NoMoreCardsError();
      }
      var retCard = this.cardPool[this.cardPoolCount];
      this.cardPoolCount += 1;
      return retCard;
    }

    /**
     * At the very end, total both hands and declare the winner.
     * All winner data is placed in this Game's variables.
     * @return {String} The descr value.
     */
    declareWinner() {
      // First make sure everything is totaled.
      this.playerPoints = Game.getTotalPoints(this.playerCards);
      this.bankerPoints = Game.getTotalPoints(this.bankerCards);

      if (this.playerPoints > this.bankerPoints) {
        this.winner = 'Player';
        this.descr = 'Player, ';
        if (this.natural) {
          this.descr += "Natural ";
        }
        this.descr += this.playerPoints + " over " + this.bankerPoints;
      } else if (this.bankerPoints > this.playerPoints) {
        this.winner = 'Banker';
        this.descr = 'Banker, ';
        if (this.natural) {
          this.descr += "Natural ";
        }
        this.descr += this.bankerPoints + " over " + this.playerPoints;
      } else {
        this.winner = 'Tie'
        this.descr = 'Tie, ';
        if (this.natural) {
          this.descr += "Natural ";
        }
        this.descr += this.playerPoints;
      }
      Game.log(this.descr);
      return this.descr;
    }

    /**
     * Get the total point value of an array of cards. Only the ones digit is used.
     * @param {Array<Card>} The cards being totaled.
     * @return {Number} The total point value, modulo 10.
     */
    static getTotalPoints(cards) {
      var pointValue = 0;
      for (var i=0; i<cards.length; i++) {
        pointValue += cards[i].points;
      }
      return pointValue % 10;
    }

    /**
     * Output a dealer message. This will help end users to follow what is happening.
     * As a default catch, this will log to console because there's no better place presently.
     * This method should be overridden with this class extended to avoid outputting to console.
     * @param {String} The message to output.
     */
    static log(message) {
      console.log(message);
    }

    /**
     * Determine if another card should be drawn.
     * @param currentTotal {Number} The current point total.
     * @param thirdPoints {Number} The point value of the player's third card, or -1 if none.
     * @return {Boolean} Should a card be drawn?
     */
    static shouldDraw(currentTotal, thirdPoints) {
      if (thirdPoints < 0) {
        // When no third player card is drawn, or this is for the player, draw on 0-5, else stand.
        return currentTotal <= 5;
      }
      if (currentTotal <= 2) {
        // When banker has 0-2, it draws on any third card.
        return true;
      }
      if (currentTotal === 3) {
        // When banker has 3, it stands if the third card is an 8, otherwise draws.
        return thirdPoints !== 8;
      }
      if (currentTotal === 4) {
        // When banker has 4, it draws if the third card is a 2-7, otherwise stands.
        return thirdPoints >= 2 && thirdPoints <= 7;
      }
      if (currentTotal === 5) {
        // When banker has 5, it draws if the third card is a 4-7, otherwise stands.
        return thirdPoints >= 4 && thirdPoints <= 7;
      }
      if (currentTotal === 6) {
        // When banker has 6, it draws if the third card is a 6-7, otherwise stands.
        return thirdPoints >= 6 && thirdPoints <= 7;
      }
      return false;
    }

  }

  function exportToGlobal(global) {
    global.Card = Card;
    global.Game = Game;
  }

  // Export the classes for node.js use.
  if (typeof exports !== 'undefined') {
    exportToGlobal(exports);
  }

  // Add the classes to the window for browser use.
  if (typeof window !== 'undefined') {
    exportToGlobal(window);
  }

})();

