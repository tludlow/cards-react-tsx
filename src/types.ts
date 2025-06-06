export enum CardSuit {
  Clubs = "clubs",
  Diamonds = "diamonds",
  Hearts = "hearts",
  Spades = "spades",
}

export const rankNums = {
  ace: 'ace',
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  jack: 10,
  king: 10,
  queen: 10,
};

export enum CardRank {
  Ace = "ace",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "jack",
  Queen = "queen",
  King = "king",
}

export type GameResult = "no_result" | "player_win" | "dealer_win" | "draw";

export type Turn = "player_turn" | "dealer_turn";

export type Card = {
  suit: CardSuit;
  rank: CardRank;
};

export type CardDeck = Array<Card>;
export type Hand = Array<Card>;
export type GameState = {
  cardDeck: CardDeck;
  playerHand: Hand;
  dealerHand: Hand;
  turn: Turn;
};
