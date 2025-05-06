import { useState } from "react";
import {
  Card,
  CardRank,
  CardDeck,
  CardSuit,
  GameState,
  Hand,
  GameResult,
  rankNums,
} from "./types";

//UI Elements
const CardBackImage = () => (
  <img src={process.env.PUBLIC_URL + `/SVG-cards/png/1x/back.png`} />
);

const CardImage = ({ suit, rank }: Card) => {
  const card = rank === CardRank.Ace ? 1 : rank;
  return (
    <img
      src={
        process.env.PUBLIC_URL +
        `/SVG-cards/png/1x/${suit.slice(0, -1)}_${card}.png`
      }
    />
  );
};

//Setup
const newCardDeck = (): CardDeck =>
  Object.values(CardSuit)
    .map((suit) =>
      Object.values(CardRank).map((rank) => ({
        suit,
        rank,
      }))
    )
    .reduce((a, v) => [...a, ...v]);

const shuffle = (deck: CardDeck): CardDeck => {
  return deck.sort(() => Math.random() - 0.5);
};

const takeCard = (deck: CardDeck): { card: Card; remaining: CardDeck } => {
  const card = deck[deck.length - 1];
  const remaining = deck.slice(0, deck.length - 1);
  return { card, remaining };
};

const setupGame = (): GameState => {
  const cardDeck = shuffle(newCardDeck());
  return {
    playerHand: cardDeck.slice(cardDeck.length - 2, cardDeck.length),
    dealerHand: cardDeck.slice(cardDeck.length - 4, cardDeck.length - 2),
    cardDeck: cardDeck.slice(0, cardDeck.length - 4), // remaining cards after player and dealer have been give theirs
    turn: "player_turn",
  };
};

//Scoring
const calculateHandScore = (hand: Hand): number => {
  let aceCount = 0;
  let score = 0;

  for (const card of hand) {
    let cardScore = rankNums[card.rank];

    if (cardScore === 'ace') {
      score = score + 11;
      aceCount = aceCount + 1;
    } else {
      score = score + Number(cardScore);
    }
  }

  // We have been greedy up until this point assuming every ace can be 11.
  // We can easily be in a position now where we have gone bust. So let's "discount"
  // as many aces as required (replacing them 1 with instead of 11) until we are within a
  // valid blackjack score

  while (aceCount > 0 && score > 21) {
    // Replace an ace that was counted as 11 with 1 by minusing 10 from the score
    score = score - 10;
    aceCount = aceCount - 1;
  }

  return score;
};

const handHasBlackjack = (hand: Hand) => {
  return hand.length === 2 && calculateHandScore(hand) === 21;
};

const determineGameResult = (state: GameState): GameResult => {
  const playerHandScore = calculateHandScore(state.playerHand);
  const dealerHandScore = calculateHandScore(state.dealerHand);

  // Cases of going bust, automatic win for the other player
  if (playerHandScore > 21) {
    return 'dealer_win';
  }

  if (dealerHandScore > 21) {
    return 'player_win';
  }

  // If they both have blackhack (ace and face card) then it's a draw
  if (
    handHasBlackjack(state.playerHand) &&
    handHasBlackjack(state.dealerHand)
  ) {
    return 'draw';
  }

  // If the player has blackjack then they win
  if (handHasBlackjack(state.playerHand)) {
    return 'player_win';
  }

  if (playerHandScore === dealerHandScore) {
    return 'draw';
  }

  // Whoever has the largest score now wins
  if (playerHandScore > dealerHandScore) {
    return 'player_win';
  } else {
    return 'dealer_win';
  }
};

//Player Actions
const playerStands = (state: GameState): GameState => {
  // If the dealer has a score of 16 or less then the dealer must take another card
  const dealerHandScore = calculateHandScore(state.dealerHand);
  if (dealerHandScore <= 16) {
    const newDealerCard = takeCard(state.cardDeck).card;
    const newState: GameState = {
      ...state,
      dealerHand: [...state.dealerHand, newDealerCard],
    };

    return newState;
  }

  return {
    ...state,
    turn: "dealer_turn",
  };
};

const playerHits = (state: GameState): GameState => {
  const { card, remaining } = takeCard(state.cardDeck);
  return {
    ...state,
    cardDeck: remaining,
    playerHand: [...state.playerHand, card],
  };
};

//UI Component
const Game = (): JSX.Element => {
  const [state, setState] = useState(setupGame());

  return (
    <>
      <div>
        <p>There are {state.cardDeck.length} cards left in deck</p>
        <button
          disabled={state.turn === "dealer_turn"}
          onClick={(): void => setState(playerHits)}
        >
          Hit
        </button>
        <button
          disabled={state.turn === "dealer_turn"}
          onClick={(): void => setState(playerStands)}
        >
          Stand
        </button>
        <button onClick={(): void => setState(setupGame())}>Reset</button>
      </div>
      <p>Player Cards</p>
      <div>
        {state.playerHand.map(CardImage)}
        <p>Player Score {calculateHandScore(state.playerHand)}</p>
      </div>
      <p>Dealer Cards</p>
      {state.turn === "player_turn" && state.dealerHand.length > 0 ? (
        <div>
          <CardBackImage />
          <CardImage {...state.dealerHand[1]} />
        </div>
      ) : (
        <div>
          {state.dealerHand.map(CardImage)}
          <p>Dealer Score {calculateHandScore(state.dealerHand)}</p>
        </div>
      )}
      {state.turn === "dealer_turn" &&
      determineGameResult(state) != "no_result" ? (
        <p>{determineGameResult(state)}</p>
      ) : (
        <p>{state.turn}</p>
      )}
    </>
  );
};

export {
  Game,
  playerHits,
  playerStands,
  determineGameResult,
  calculateHandScore,
  setupGame,
};
