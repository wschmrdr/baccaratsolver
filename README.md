## Description
baccaratsolver is a single game engine base written Javascript. It was based from the pokersolver available on [**CasinoRPG**](http://casinorpg.com), an HTML5 MMORPG that features many casino games, although may be utilized for any of your casino game needs. It is designed for use on either the client (browser) or the server (Node.js). This library is capable of:

* Evaluating up to 6 cards dealt, whether provided at start or as the game progresses
* Calculating the score of the hands (0-9)
* Giving a description of all important events in the game
* Returning the winner of the hand (Player, Banker, Tie)
* Returning a detailed description (Player, Natural 8 over 5)
* Works in both the browser and Node.js

## Installation
```
npm install baccaratsolver
```

## Examples
#### Server Usage
```javascript
var Game = require('baccaratsolver').Game;
```

#### Browser Usage
```javascript
<script src="/path/to/baccaratsolver.js"></script>
<script>
  var game = new Game(['...']);
  ...
</script>
```

Give six cards and then determine the winner.
```javascript
var game = Game(['Ad', 'Jc', 'Th', '2d', '3c', 'Kd']);
var winner = game.playGame(); // "Player, 3 over 2"
```

Play a game and return the winner and description.
```javascript
var game = Game(['Ad', 'Jc', 'Th', '2d', '3c', 'Kd']);
game.playGame();
console.log(game.winner); // Player
console.log(game.natural); // false
console.log(game.descr); // Player, 3 over 2
```

## API
### Game Methods
#### constructor(cards)
Creates the game for play. This would would be a single bet hand in a casino.
This should be re-created for each new hand, and only used once for a result.

* **cards** `Array` An array of six cards, whether in String or Card format, to be used. At least four are dealt.

The cards parameter is optional, but the dealCard method must then be overridden to bring cards into the hand.

#### playGame()
Run the actual game mechanics itself.
Returns the result description. 

### Methods Recommended to Override
#### dealCard()
Returns a Card object that is dealt.
This method may be overridden to use a third party method to deal a card.

When the method is not overridden, this uses the array of cards entered in the constructor and deals in order.
If there are no remaining cards from the input, NoMoreCardsError is thrown.

If your setup uses a shoe, it is recommended to override this method, returning a Card object.
Remember that anywhere from 4 to 6 cards are dealt, so unused cards could be unintentionally burned or exposed.

#### log(message)
Outputs a message. Designed to be dealer "chatter" at each step of the game.

* **message** `String` The message to output.

When the method is not overridden, this outputs to console.
Override this static method if you want the output to go somewhere else.

### Errors
#### InvalidCardError
String representation of card is not in the proper format.

#### NoMoreCardsError
A card cannot be dealt.

## Testing
```
npm install
npm test
```

## License
Copyright (c) 2018 wschmrdr

Released under the MIT License.
