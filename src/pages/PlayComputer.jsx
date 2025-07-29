import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Bot, User, Coins } from 'lucide-react';
import { DragDropContext } from '@hello-pangea/dnd';
import DoublingCube from '../components/backgammon/DoublingCube';
import DoubleOfferModal from '../components/backgammon/DoubleOfferModal';
import BackgammonBoard from '../components/backgammon/BackgammonBoard';

const STARTING_POSITION = {
  24: { color: 'white', count: 2 }, 13: { color: 'white', count: 5 }, 8: { color: 'white', count: 3 }, 6: { color: 'white', count: 5 },
  1: { color: 'black', count: 2 }, 12: { color: 'black', count: 5 }, 17: { color: 'black', count: 3 }, 19: { color: 'black', count: 5 }
};

const DiceIcon = ({ value }) => {
  const icons = { 1: Dice1, 2: Dice2, 3: Dice3, 4: Dice4, 5: Dice5, 6: Dice6 };
  const Icon = icons[value];
  return <Icon className="w-6 h-6" />;
};

export default function PlayComputer() {
  const [gameState, setGameState] = useState({
    position: JSON.parse(JSON.stringify(STARTING_POSITION)),
    currentPlayer: 'white',
    dice: [0, 0],
    movesRemaining: [],
    bar: { white: 0, black: 0 },
    bornOff: { white: 0, black: 0 },
    gamePhase: 'pre-match',
    winner: null,
    isFirstMove: true,
    cubeValue: 1,
    cubeOwner: 'center',
    isDoubleOffered: false,
    computerShouldRoll: false,
  });

  const [matchState, setMatchState] = useState({
    targetScore: 1,
    playerScore: 0,
    computerScore: 0,
    isMatchStarted: false,
    matchWinner: null,
    useClock: false,
    playerTime: 0,
    computerTime: 0,
    isGracePeriodActive: false,
    gracePeriodCountdown: 0,
    isCrawfordGame: false,
  });

  const [timeLossWinner, setTimeLossWinner] = useState(null);
  const [gameLog, setGameLog] = useState(['Select match length to start.']);
  const [moveHistory, setMoveHistory] = useState([]);
  const [turnStartState, setTurnStartState] = useState(null);

  const addToLog = (message) => {
    setGameLog(prev => [...prev.slice(-4), message]);
  };

  const isAllCheckersInHomeBoard = (position, bornOff, player) => {
    const homeRange = player === 'white' ? { min: 1, max: 6 } : { min: 19, max: 24 };
    let checkersInHome = bornOff?.[player] ?? 0;
    for (let point = 1; point <= 24; point++) {
      if (position[point] && position[point].color === player) {
        if ((player === 'white' && point > 6) || (player === 'black' && point < 19)) {
          return false; // Found a checker outside the home board
        }
        checkersInHome += position[point].count;
      }
    }
    return checkersInHome === 15;
  };

  // --- STRATEGIC AI HELPER FUNCTIONS ---

  const STRATEGIC_POINT_VALUES = {
    24: 5, 23: 5, 22: 4, 21: 4, 20: 3, 19: 3,
    1: 2, 2: 2, 3: 3, 4: 4, 5: 6, 6: 3, 7: 5, 8: 2,
  };

  const evaluateBoardState = (position, bar, bornOff, player) => {
    let score = 0;
    const opponent = player === 'white' ? 'black' : 'white';
    const playerPips = calculatePipCount(player, { position, bar });
    const opponentPips = calculatePipCount(opponent, { position, bar });
    score += (opponentPips - playerPips) * 1.5;
    let playerBlots = 0, opponentBlots = 0;
    for (let i = 1; i <= 24; i++) {
      if (position[i]) {
        if (position[i].color === player) {
          if (position[i].count === 1) playerBlots++;
          else if (position[i].count > 1) score += STRATEGIC_POINT_VALUES[player === 'white' ? i : 25 - i] || 1;
        } else {
          if (position[i].count === 1) opponentBlots++;
        }
      }
    }
    score -= playerBlots * 5;
    score += opponentBlots * 10;
    score -= bar[player] * 25;
    score += bar[opponent] * 15;
    score += bornOff[player] * 200;
    if (isAllCheckersInHomeBoard(position, bornOff, player)) score += bornOff[player] * 50;
    if (bornOff[player] === 15) score = Infinity;
    if (bornOff[opponent] === 15) score = -Infinity;
    return score;
  };
  
  const findAllMoveSequences = (position, bar, bornOff, player, dice) => {
    let sequences = [];
    const queue = [{
      pos: JSON.parse(JSON.stringify(position)),
      barState: JSON.parse(JSON.stringify(bar)),
      bornOffState: JSON.parse(JSON.stringify(bornOff)),
      diceLeft: [...dice],
      path: []
    }];

    while (queue.length > 0) {
      const { pos, barState, bornOffState, diceLeft, path } = queue.shift();
      const validMoves = getValidMoves(pos, barState, bornOffState, player, diceLeft);
      if (validMoves.length === 0) {
        sequences.push({ moves: path, finalState: { position: pos, bar: barState, bornOff: bornOffState } });
        continue;
      }
      for (const move of validMoves) {
        const nextState = applyTempMove(pos, barState, bornOffState, player, move);
        const newDiceLeft = [...diceLeft];
        const dieIndex = newDiceLeft.indexOf(move.diceUsed[0]);
        if (dieIndex !== -1) {
          newDiceLeft.splice(dieIndex, 1);
          queue.push({
            pos: nextState.position,
            barState: nextState.bar,
            bornOffState: nextState.bornOff,
            diceLeft: newDiceLeft,
            path: [...path, move]
          });
        }
      }
    }
    
    if (sequences.length === 0) return [{ moves: [], finalState: { position, bar, bornOff } }];

    let maxMoves = 0;
    sequences.forEach(seq => { if (seq.moves.length > maxMoves) maxMoves = seq.moves.length; });

    if (dice.length === 2 && dice[0] !== dice[1] && maxMoves === 1) {
      const higherDie = Math.max(dice[0], dice[1]);
      const canPlayHigherDie = sequences.some(seq => seq.moves.length === 1 && seq.moves[0].diceUsed[0] === higherDie);
      if(canPlayHigherDie) {
         return sequences.filter(seq => seq.moves.length === 1 && seq.moves[0].diceUsed[0] === higherDie);
      }
    }
    return sequences.filter(s => s.moves.length === maxMoves);
  };

  const applyTempMove = (pos, barState, bornOffState, player, move) => {
    const newPos = JSON.parse(JSON.stringify(pos)), newBar = { ...barState }, newBornOff = { ...bornOffState };
    const opponent = player === 'white' ? 'black' : 'white';
    if (move.from === 'bar') newBar[player]--;
    else {
      newPos[move.from].count--;
      if (newPos[move.from].count === 0) delete newPos[move.from];
    }
    if (move.to === 'off') newBornOff[player]++;
    else {
      if (newPos[move.to] && newPos[move.to].color === opponent && newPos[move.to].count === 1) {
        newBar[opponent]++;
        newPos[move.to] = { color: player, count: 1 };
      } else {
        if (!newPos[move.to]) newPos[move.to] = { color: player, count: 0 };
        newPos[move.to].count++;
      }
    }
    return { position: newPos, bar: newBar, bornOff: newBornOff };
  };

  const calculatePipCount = (player, customState = null) => {
    const state = customState || gameState;
    const { position, bar } = state;
    let pipCount = 0;
    for (let point = 1; point <= 24; point++) {
      if (position[point] && position[point].color === player) {
        pipCount += position[point].count * (player === 'white' ? point : 25 - point);
      }
    }
    if (bar[player] > 0) pipCount += bar[player] * 25;
    return pipCount;
  };

  const canEnterFromBar = (position, bar, player, dice) => {
    if (bar[player] === 0) return true;
    for (const die of dice) {
      const entryPoint = player === 'white' ? 25 - die : die;
      const targetPoint = position[entryPoint];
      if (!targetPoint || targetPoint.color === player || targetPoint.count <= 1) return true;
    }
    return false;
  };

  const getHighestCheckerPoint = (position, player) => {
    if (player === 'white') {
      for (let i = 6; i >= 1; i--) if (position[i]?.color === 'white') return i;
    } else {
      for (let i = 24; i >= 19; i--) if (position[i]?.color === 'black') return i;
    }
    return 0;
  };

  const getValidMoves = (position, bar, bornOff, player, dice) => {
    const moves = [];
    if (bar[player] > 0) {
      const seenMoves = new Set();
      for (const die of dice) {
        const entryPoint = player === 'white' ? 25 - die : die;
        const targetPoint = position[entryPoint];
        if (!targetPoint || targetPoint.color === player || targetPoint.count <= 1) {
          const moveKey = `bar-${entryPoint}`;
          if (!seenMoves.has(moveKey)) {
            moves.push({ from: 'bar', to: entryPoint, diceUsed: [die] });
            seenMoves.add(moveKey);
          }
        }
      }
      return moves;
    }

    const canBearOff = isAllCheckersInHomeBoard(position, bornOff, player);
    const highestCheckerPoint = canBearOff ? getHighestCheckerPoint(position, player) : 0;
    const allPossibleMoves = [];

    for (let point = 1; point <= 24; point++) {
      if (position[point] && position[point].color === player) {
        for (const die of dice) {
          const targetPointNumber = player === 'white' ? point - die : point + die;
          if (targetPointNumber >= 1 && targetPointNumber <= 24) {
            const targetPoint = position[targetPointNumber];
            if (!targetPoint || targetPoint.color === player || targetPoint.count <= 1) {
              allPossibleMoves.push({ from: point, to: targetPointNumber, diceUsed: [die] });
            }
          } else if (canBearOff) {
            const exactBearOffPoint = player === 'white' ? die : 25 - die;
            if (point === exactBearOffPoint) {
              allPossibleMoves.push({ from: point, to: 'off', diceUsed: [die] });
            } else if (point === highestCheckerPoint && ((player === 'white' && point < die) || (player === 'black' && point > (25 - die)))) {
              allPossibleMoves.push({ from: point, to: 'off', diceUsed: [die] });
            }
          }
        }
      }
    }

    const uniqueMoves = [];
    const seenMoves = new Set();
    for (const move of allPossibleMoves) {
      const moveKey = `${move.from}-${move.to}-${move.diceUsed[0]}`;
      if (!seenMoves.has(moveKey)) {
        uniqueMoves.push(move);
        seenMoves.add(moveKey);
      }
    }
    return uniqueMoves;
  };

  const createModifiedDiceDisplay = () => {
    const hasBlockedBarCheckers = gameState.bar[gameState.currentPlayer] > 0 && !canEnterFromBar(gameState.position, gameState.bar, gameState.currentPlayer, gameState.movesRemaining);
    const validMovesForCurrentPlayer = gameState.movesRemaining.length > 0 ? getValidMoves(gameState.position, gameState.bar, gameState.bornOff, gameState.currentPlayer, gameState.movesRemaining) : [];
    const playerIsStuck = !hasBlockedBarCheckers && gameState.movesRemaining.length > 0 && validMovesForCurrentPlayer.length === 0;
    if (hasBlockedBarCheckers || playerIsStuck) {
      return gameState.dice.map((dieValue, index) => ({ value: dieValue, isUsed: true, playerColor: gameState.currentPlayer, id: `blocked-${index}` }));
    }
    if (gameState.dice[0] === 0) return [];
    const isDoubles = gameState.dice[0] === gameState.dice[1];
    const diceArray = [];
    const movesRemainingCopy = [...gameState.movesRemaining];
    if (isDoubles) {
      for (let i = 0; i < 4; i++) {
        const index = movesRemainingCopy.indexOf(gameState.dice[0]);
        const isUsed = index === -1;
        if (!isUsed) movesRemainingCopy.splice(index, 1);
        diceArray.push({ value: gameState.dice[0], isUsed, playerColor: gameState.currentPlayer, id: `doubles-${i}` });
      }
    } else {
      gameState.dice.forEach((dieValue, index) => {
        const dieIndex = movesRemainingCopy.indexOf(dieValue);
        const isUsed = dieIndex === -1;
        if (!isUsed) movesRemainingCopy.splice(dieIndex, 1);
        diceArray.push({ value: dieValue, isUsed, playerColor: gameState.currentPlayer, id: `regular-${index}` });
      });
    }
    return diceArray;
  };

  const getHighestDiceMove = (from) => {
    const hasBlockedBarCheckers = gameState.bar.white > 0 && !canEnterFromBar(gameState.position, gameState.bar, 'white', gameState.movesRemaining);
    const validMovesForTurn = gameState.currentPlayer === 'white' && gameState.movesRemaining.length > 0 ? getValidMoves(gameState.position, gameState.bar, gameState.bornOff, 'white', gameState.movesRemaining) : [];
    const playerIsStuck = !hasBlockedBarCheckers && gameState.movesRemaining.length > 0 && validMovesForTurn.length === 0;
    if (gameState.gamePhase === 'pre-match' || gameState.currentPlayer !== 'white' || gameState.movesRemaining.length === 0 || gameState.isDoubleOffered || hasBlockedBarCheckers || playerIsStuck) return null;
    const validMoves = getValidMoves(gameState.position, gameState.bar, gameState.bornOff, 'white', gameState.movesRemaining);
    const singleDieMoves = validMoves.filter(move => move.from === from && move.diceUsed.length === 1);
    if (singleDieMoves.length === 0) return null;
    return singleDieMoves.sort((a, b) => b.diceUsed[0] - a.diceUsed[0])[0];
  };

  const handleCheckerClick = (from) => {
    const bestSingleMove = getHighestDiceMove(from);
    if (bestSingleMove) {
      executeMove(bestSingleMove);
      addToLog(`You moved: ${bestSingleMove.from === 'bar' ? 'Bar' : bestSingleMove.from}/${bestSingleMove.to === 'off' ? 'Off' : bestSingleMove.to}`);
    }
  };

  const executeMove = (move) => {
    const currentState = JSON.parse(JSON.stringify(gameState));
    setGameState(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      const { from, to, diceUsed } = move;
      const player = prev.currentPlayer;
      const opponent = player === 'white' ? 'black' : 'white';
      if (from === 'bar') newState.bar[player]--;
      else {
        newState.position[from].count--;
        if (newState.position[from].count === 0) delete newState.position[from];
      }
      if (to === 'off') newState.bornOff[player]++;
      else {
        if (newState.position[to]?.color === opponent && newState.position[to].count === 1) {
          newState.bar[opponent]++;
          newState.position[to] = { color: player, count: 1 };
        } else {
          if (!newState.position[to]) newState.position[to] = { color: player, count: 0 };
          newState.position[to].count++;
        }
      }
      const newMovesRemaining = [...newState.movesRemaining];
      diceUsed.forEach(die => { const dieIndex = newMovesRemaining.indexOf(die); if (dieIndex > -1) newMovesRemaining.splice(dieIndex, 1); });
      newState.movesRemaining = newMovesRemaining;
      if (newState.bornOff[player] === 15) { newState.gamePhase = 'ended'; newState.winner = player; }
      return newState;
    });
    setMoveHistory(prev => [...prev, { move, stateBefore: currentState }]);
  };

  const executeSingleComputerMove = (move) => {
    setGameState(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      const { from, to } = move;
      const player = 'black';
      const opponent = 'white';
      if (from === 'bar') newState.bar[player]--;
      else {
        newState.position[from].count--;
        if (newState.position[from].count === 0) delete newState.position[from];
      }
      if (to === 'off') newState.bornOff[player]++;
      else {
        if (newState.position[to]?.color === opponent && newState.position[to].count === 1) {
          newState.bar[opponent]++;
          newState.position[to] = { color: player, count: 1 };
        } else {
          if (!newState.position[to]) newState.position[to] = { color: player, count: 0 };
          newState.position[to].count++;
        }
      }
      if (newState.bornOff[player] === 15) { newState.gamePhase = 'ended'; newState.winner = player; }
      return newState;
    });
  };

  const executeComputerMovesSequentially = (moves) => {
    if (moves.length === 0) {
      setTimeout(() => {
        setGameState(prev => {
          if (prev.gamePhase === 'ended') return prev;
          return { ...prev, currentPlayer: 'white', dice: [0, 0], movesRemaining: [], isFirstMove: false };
        });
        if (gameState.gamePhase !== 'ended') addToLog("Your turn to roll.");
        if (matchState.useClock) setMatchState(prev => ({ ...prev, isGracePeriodActive: true, gracePeriodCountdown: 12 }));
      }, 1000);
      return;
    }
    const move = moves[0];
    executeSingleComputerMove(move);
    setTimeout(() => {
      addToLog(`Computer moved: ${move.from === 'bar' ? 'Bar' : move.from}/${move.to === 'off' ? 'Off' : move.to}`);
      executeComputerMovesSequentially(moves.slice(1));
    }, 800);
  };

  const canPlayerDouble = () => {
    if (gameState.currentPlayer !== 'white' || (gameState.cubeOwner !== 'center' && gameState.cubeOwner !== 'white') || gameState.dice[0] !== 0 || gameState.gamePhase !== 'playing' || gameState.isDoubleOffered) return false;
    if (matchState.isCrawfordGame) return false;
    const doubledValue = gameState.cubeValue * 2;
    return !(matchState.playerScore + doubledValue >= matchState.targetScore && matchState.computerScore + doubledValue >= matchState.targetScore);
  };

  const canComputerDouble = () => {
    if ((gameState.cubeOwner !== 'center' && gameState.cubeOwner !== 'black')) return false;
    if (matchState.isCrawfordGame) return false;
    const doubledValue = gameState.cubeValue * 2;
    return !(matchState.playerScore + doubledValue >= matchState.targetScore && matchState.computerScore + doubledValue >= matchState.targetScore);
  };

  const getCrawfordStatus = () => {
    if (!matchState.isMatchStarted || matchState.targetScore === 1) return null;
    const playerOneAway = matchState.playerScore === matchState.targetScore - 1;
    const computerOneAway = matchState.computerScore === matchState.targetScore - 1;
    if (matchState.isCrawfordGame && (playerOneAway || computerOneAway)) return 'CRAWFORD';
    if (!matchState.isCrawfordGame && (playerOneAway || computerOneAway)) return 'POST CRAWFORD';
    return null;
  };

  const handleComputerTurn = (skipDoubleCheck = false) => {
    if (gameState.gamePhase === 'pre-match' || (gameState.dice[0] !== 0 && !gameState.isFirstMove)) return;
    setMoveHistory([]);
    setTurnStartState(null);
    if (!skipDoubleCheck && !gameState.isFirstMove && canComputerDouble()) {
      const playerPips = calculatePipCount('white');
      const computerPips = calculatePipCount('black');
      if (computerPips < playerPips - 8 && gameState.cubeValue < 64) {
        addToLog(`Computer offers to double to ${gameState.cubeValue * 2}.`);
        setGameState(prev => ({ ...prev, isDoubleOffered: true }));
        return;
      }
    }
    const findAndExecuteBestSequence = (diceToUse) => {
      const moveSequences = findAllMoveSequences(gameState.position, gameState.bar, gameState.bornOff, 'black', diceToUse);
      if (moveSequences.length === 0 || (moveSequences[0] && moveSequences[0].moves.length === 0)) {
        addToLog("Computer has no legal moves.");
        setTimeout(() => {
          setGameState(prev => ({ ...prev, currentPlayer: 'white', dice: [0, 0], movesRemaining: [], isFirstMove: false }));
          addToLog("Your turn to roll.");
          if (matchState.useClock) setMatchState(prev => ({ ...prev, isGracePeriodActive: true, gracePeriodCountdown: 12 }));
        }, 1000);
        return;
      }
      let bestMoveSequence = null, bestScore = -Infinity;
      moveSequences.forEach(seq => {
        const score = evaluateBoardState(seq.finalState.position, seq.finalState.bar, seq.finalState.bornOff, 'black');
        if (score > bestScore) {
          bestScore = score;
          bestMoveSequence = seq;
        }
      });
      if (!bestMoveSequence) bestMoveSequence = moveSequences[0];
      executeComputerMovesSequentially(bestMoveSequence.moves);
    };
    if (gameState.isFirstMove) {
      addToLog("Computer makes opening move...");
      findAndExecuteBestSequence(gameState.movesRemaining);
    } else {
      addToLog("Computer is thinking...");
      const die1 = Math.floor(Math.random() * 6) + 1, die2 = Math.floor(Math.random() * 6) + 1;
      const rolledDice = die1 === die2 ? [die1, die1, die1, die1] : [die1, die2];
      setGameState(prev => ({ ...prev, dice: [die1, die2], movesRemaining: rolledDice }));
      addToLog(`Computer rolled ${die1}-${die2}`);
      setTimeout(() => findAndExecuteBestSequence(rolledDice), 1200);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    const hasBlockedBarCheckers = gameState.bar.white > 0 && !canEnterFromBar(gameState.position, gameState.bar, 'white', gameState.movesRemaining);
    const validMovesForTurn = gameState.currentPlayer === 'white' && gameState.movesRemaining.length > 0 ? getValidMoves(gameState.position, gameState.bar, gameState.bornOff, 'white', gameState.movesRemaining) : [];
    const playerIsStuck = !hasBlockedBarCheckers && gameState.movesRemaining.length > 0 && validMovesForTurn.length === 0;
    if (gameState.gamePhase === 'pre-match' || !destination || gameState.currentPlayer !== 'white' || gameState.movesRemaining.length === 0 || gameState.isDoubleOffered || hasBlockedBarCheckers || playerIsStuck) return;
    let from = source.droppableId.startsWith('point-') ? parseInt(source.droppableId.replace('point-', '')) : (source.droppableId === 'bar-white' ? 'bar' : null);
    if (from === null) return;
    let to = destination.droppableId.startsWith('point-') ? parseInt(destination.droppableId.replace('point-', '')) : (destination.droppableId === 'off-white' ? 'off' : null);
    if (to === null) return;
    const validMoves = getValidMoves(gameState.position, gameState.bar, gameState.bornOff, 'white', gameState.movesRemaining);
    const move = validMoves.find(m => m.from === from && m.to === to);
    if (move) {
      executeMove(move);
      addToLog(`You moved: ${move.from === 'bar' ? 'Bar' : move.from}/${move.to === 'off' ? 'Off' : move.to}`);
    }
  };

  const handleRollDice = () => {
    if (gameState.gamePhase === 'pre-match') return;
    setMoveHistory([]);
    setTurnStartState(JSON.parse(JSON.stringify(gameState)));
    if (gameState.gamePhase === 'opening') {
      let playerDie, computerDie;
      do {
        playerDie = Math.floor(Math.random() * 6) + 1;
        computerDie = Math.floor(Math.random() * 6) + 1;
      } while (playerDie === computerDie);
      const firstPlayer = playerDie > computerDie ? 'white' : 'black';
      const firstRoll = [playerDie, computerDie].sort((a, b) => b - a);
      setGameState(prev => ({ ...prev, currentPlayer: firstPlayer, dice: firstRoll, movesRemaining: firstRoll, gamePhase: 'playing', isFirstMove: true }));
      addToLog(`You rolled ${playerDie}, computer rolled ${computerDie}. ${playerDie > computerDie ? "You go first!" : "Computer goes first!"}`);
      if (matchState.useClock) setMatchState(prev => ({ ...prev, isGracePeriodActive: true, gracePeriodCountdown: 12 }));
    } else if (gameState.currentPlayer === 'white' && gameState.movesRemaining.length === 0 && gameState.gamePhase === 'playing' && !gameState.isDoubleOffered) {
      const die1 = Math.floor(Math.random() * 6) + 1, die2 = Math.floor(Math.random() * 6) + 1;
      setGameState(prev => ({ ...prev, dice: [die1, die2], movesRemaining: die1 === die2 ? [die1, die1, die1, die1] : [die1, die2], isFirstMove: false }));
      addToLog(`You rolled ${die1}-${die2}`);
      if (matchState.useClock) setMatchState(prev => ({ ...prev, isGracePeriodActive: true, gracePeriodCountdown: 12 }));
    }
  };

  const handleOfferDouble = () => {
    if (gameState.gamePhase !== 'pre-match' && canPlayerDouble()) {
      addToLog(`You offered to double to ${gameState.cubeValue * 2}.`);
      setGameState(prev => ({ ...prev, isDoubleOffered: true }));
    }
  };

  const handleUndoLastMove = () => {
    if (moveHistory.length > 0) {
      const { move, stateBefore } = moveHistory.pop();
      setGameState(stateBefore);
      setMoveHistory([...moveHistory]);
      addToLog(`Undid move: ${move.from === 'bar' ? 'Bar' : move.from}/${move.to === 'off' ? 'Off' : move.to}`);
    }
  };

  const handleConfirmTurn = () => {
    const hasBlockedBarCheckers = gameState.bar.white > 0 && !canEnterFromBar(gameState.position, gameState.bar, 'white', gameState.movesRemaining);
    const validMovesForTurn = getValidMoves(gameState.position, gameState.bar, gameState.bornOff, 'white', gameState.movesRemaining);
    const playerIsStuck = !hasBlockedBarCheckers && validMovesForTurn.length === 0;
    if (gameState.movesRemaining.length === 0 || (gameState.movesRemaining.length > 0 && (hasBlockedBarCheckers || playerIsStuck))) {
      addToLog(hasBlockedBarCheckers ? "No legal moves from bar. Turn passed." : (playerIsStuck ? "No legal moves. Turn passed." : "Turn confirmed."));
      setMoveHistory([]);
      setTurnStartState(null);
      setGameState(prev => ({ ...prev, currentPlayer: 'black', movesRemaining: [], dice: [0, 0], isFirstMove: false }));
      if (matchState.useClock) setMatchState(prev => ({ ...prev, isGracePeriodActive: true, gracePeriodCountdown: 12 }));
    }
  };

  const handlePlayerTakesDouble = () => {
    addToLog(`You take the double. Stakes are now ${gameState.cubeValue * 2}.`);
    setGameState(prev => ({ ...prev, cubeValue: prev.cubeValue * 2, cubeOwner: 'white', isDoubleOffered: false, computerShouldRoll: true }));
  };

  const handlePlayerPassesDouble = () => {
    addToLog(`You passed. Computer wins ${gameState.cubeValue} point(s).`);
    setGameState(prev => ({ ...prev, gamePhase: 'ended', winner: 'black', isDoubleOffered: false }));
  };

  useEffect(() => {
    if (!matchState.useClock || gameState.gamePhase !== 'playing' || gameState.winner || timeLossWinner) return;
    const timer = setInterval(() => {
      if (gameState.isDoubleOffered) return;
      if (matchState.isGracePeriodActive) {
        setMatchState(prev => prev.gracePeriodCountdown > 1 ? { ...prev, gracePeriodCountdown: prev.gracePeriodCountdown - 1 } : { ...prev, isGracePeriodActive: false, gracePeriodCountdown: 0 });
      } else {
        const activePlayer = gameState.currentPlayer;
        const timeKey = activePlayer === 'white' ? 'playerTime' : 'computerTime';
        setMatchState(prev => {
          if (prev[timeKey] > 0) {
            const newTime = prev[timeKey] - 1;
            if (newTime <= 0) {
              const winner = activePlayer === 'white' ? 'black' : 'white';
              setGameState(g => ({ ...g, gamePhase: 'ended', winner }));
              setTimeLossWinner(winner);
              addToLog(`${activePlayer === 'white' ? 'You' : 'Computer'} ran out of time! ${winner === 'white' ? 'You win' : 'Computer win'}s by time loss.`);
              return { ...prev, [timeKey]: 0 };
            }
            return { ...prev, [timeKey]: newTime };
          }
          return prev;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [matchState.useClock, gameState.gamePhase, gameState.winner, timeLossWinner, gameState.currentPlayer, gameState.dice, matchState.isGracePeriodActive, gameState.isDoubleOffered, gameState.isFirstMove]);

  useEffect(() => {
    if (gameState.gamePhase === 'playing' && gameState.currentPlayer === 'black' && !gameState.isDoubleOffered && !gameState.computerShouldRoll) handleComputerTurn();
    if (gameState.gamePhase === 'playing' && gameState.isDoubleOffered && gameState.currentPlayer === 'white') {
      const timer = setTimeout(() => {
        const playerPips = calculatePipCount('white');
        const computerPips = calculatePipCount('black');
        if (playerPips < computerPips - 25) {
          addToLog(`Computer drops the cube and resigns.`);
          setGameState(prev => ({ ...prev, gamePhase: 'ended', winner: 'white', isDoubleOffered: false }));
        } else {
          addToLog(`Computer takes the double. Stakes are now ${gameState.cubeValue * 2}.`);
          setGameState(prev => ({ ...prev, cubeValue: prev.cubeValue * 2, cubeOwner: 'black', isDoubleOffered: false }));
          addToLog("Your turn to roll.");
          if (matchState.useClock) setMatchState(prev => ({ ...prev, isGracePeriodActive: true, gracePeriodCountdown: 12 }));
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (gameState.computerShouldRoll) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, computerShouldRoll: false }));
        handleComputerTurn(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gamePhase, gameState.isDoubleOffered, gameState.computerShouldRoll, matchState.useClock]);

  useEffect(() => {
    if (gameState.gamePhase !== 'pre-match' && !gameState.isDoubleOffered && gameState.currentPlayer === 'white' && gameState.dice[0] > 0 && gameState.movesRemaining.length > 0) {
      const hasBlockedBarCheckers = gameState.bar.white > 0 && !canEnterFromBar(gameState.position, gameState.bar, 'white', gameState.movesRemaining);
      const validMovesForTurn = getValidMoves(gameState.position, gameState.bar, gameState.bornOff, 'white', gameState.movesRemaining);
      const playerIsStuck = !hasBlockedBarCheckers && validMovesForTurn.length === 0;
      if (hasBlockedBarCheckers || playerIsStuck) {
        const timer = setTimeout(() => {
          handleConfirmTurn();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.currentPlayer, gameState.dice, gameState.movesRemaining, gameState.position, gameState.bar, gameState.gamePhase, gameState.isDoubleOffered, matchState.useClock]);

  const newGame = () => {
    setTimeLossWinner(null);
    setGameState({ position: JSON.parse(JSON.stringify(STARTING_POSITION)), currentPlayer: 'white', dice: [0, 0], movesRemaining: [], bar: { white: 0, black: 0 }, bornOff: { white: 0, black: 0 }, gamePhase: 'opening', winner: null, isFirstMove: true, cubeValue: 1, cubeOwner: 'center', isDoubleOffered: false, computerShouldRoll: false });
    setGameLog(['Game started! Roll to see who goes first.']);
    setMoveHistory([]);
    setTurnStartState(null);
  };

  const startNewMatch = () => {
    setMatchState({ targetScore: 1, playerScore: 0, computerScore: 0, isMatchStarted: false, matchWinner: null, useClock: false, playerTime: 0, computerTime: 0, isGracePeriodActive: false, gracePeriodCountdown: 0, isCrawfordGame: false });
    setTimeLossWinner(null);
    setGameState(prev => ({ ...prev, gamePhase: 'pre-match' }));
    setGameLog(['Select match length to start.']);
  };

  const handleStartMatch = () => {
    setMatchState(prev => {
      const totalTime = prev.useClock ? prev.targetScore * 2 * 60 : 0;
      return { ...prev, isMatchStarted: true, playerTime: totalTime, computerTime: totalTime };
    });
    newGame();
  };

  useEffect(() => {
    if (gameState.winner) {
      const result = getGameResult();
      if (!result) return;
      addToLog(`Game over. ${result.gameType} for ${result.finalScore} point(s).`);
      setMatchState(prev => {
        const newPlayerScore = prev.playerScore + (result.playerWon ? result.finalScore : 0);
        const newComputerScore = prev.computerScore + (!result.playerWon ? result.finalScore : 0);
        let newMatchWinner = null;
        let crawford = prev.isCrawfordGame;
        if (crawford) crawford = false;
        else if (!prev.isCrawfordGame && (newPlayerScore === prev.targetScore - 1 || newComputerScore === prev.targetScore - 1)) {
          crawford = true;
          addToLog(`--- CRAWFORD RULE IN EFFECT: No doubling for the next game. ---`);
        }
        if (newPlayerScore >= prev.targetScore) newMatchWinner = 'white';
        else if (newComputerScore >= prev.targetScore) newMatchWinner = 'black';
        if (!newMatchWinner) setTimeout(() => newGame(), 2000);
        return { ...prev, playerScore: newPlayerScore, computerScore: newComputerScore, matchWinner: newMatchWinner, isCrawfordGame: crawford };
      });
    }
  }, [gameState.winner]);

  const getGameResult = () => {
    if (timeLossWinner) return { playerWon: timeLossWinner === 'white', finalScore: gameState.cubeValue, gameType: 'Loss on Time' };
    if (!gameState.winner) return null;
    if (gameState.gamePhase === 'ended' && gameState.bornOff[gameState.winner] !== 15) return { playerWon: gameState.winner === 'white', finalScore: gameState.cubeValue, gameType: 'Cube Dropped' };
    const winner = gameState.winner, loser = winner === 'white' ? 'black' : 'white';
    let isBackgammon = false;
    if (winner === 'white') {
      if (gameState.bar.black > 0) isBackgammon = true;
      else {
        let hasCheckersInHome = false;
        for (let i = 1; i <= 6; i++) {
          if (gameState.position[i]?.color === 'black') {
            hasCheckersInHome = true;
            break;
          }
        }
        if (hasCheckersInHome) isBackgammon = true;
      }
    } else { // winner is black
      if (gameState.bar.white > 0) isBackgammon = true;
      else {
         let hasCheckersInHome = false;
        for (let i = 19; i <= 24; i++) {
           if (gameState.position[i]?.color === 'white') {
            hasCheckersInHome = true;
            break;
          }
        }
        if(hasCheckersInHome) isBackgammon = true;
      }
    }
    const isGammon = gameState.bornOff[loser] === 0 && !isBackgammon;
    const multiplier = isBackgammon ? 3 : (isGammon ? 2 : 1);
    const gameType = isBackgammon ? 'Backgammon' : (isGammon ? 'Gammon' : 'Single Game');
    return { playerWon: winner === 'white', finalScore: gameState.cubeValue * multiplier, gameType };
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const rollDisabled = gameState.gamePhase === 'pre-match' || (gameState.gamePhase === 'playing' && (gameState.currentPlayer !== 'white' || gameState.movesRemaining.length > 0)) || gameState.gamePhase === 'ended' || gameState.isDoubleOffered;
  const showGameControls = gameState.gamePhase !== 'pre-match' && gameState.currentPlayer === 'white' && gameState.gamePhase !== 'ended' && gameState.dice[0] === 0 && !gameState.isDoubleOffered;
  const showUndo = moveHistory.length > 0 && gameState.currentPlayer === 'white' && gameState.dice[0] !== 0 && gameState.gamePhase !== 'pre-match';
  const hasBlockedBarCheckers = gameState.bar.white > 0 && !canEnterFromBar(gameState.position, gameState.bar, 'white', gameState.movesRemaining);
  const validMovesForTurn = gameState.currentPlayer === 'white' && gameState.movesRemaining.length > 0 ? getValidMoves(gameState.position, gameState.bar, gameState.bornOff, 'white', gameState.movesRemaining) : [];
  const playerIsStuck = !hasBlockedBarCheckers && gameState.movesRemaining.length > 0 && validMovesForTurn.length === 0;
  const showEndTurn = gameState.gamePhase !== 'pre-match' && turnStartState && gameState.dice[0] !== 0 && gameState.currentPlayer === 'white' && !hasBlockedBarCheckers && !playerIsStuck;
  const endTurnReady = gameState.movesRemaining.length === 0 || (gameState.movesRemaining.length > 0 && (hasBlockedBarCheckers || playerIsStuck));
  const isComputerOfferingDouble = gameState.isDoubleOffered && gameState.currentPlayer === 'black';
  const gameResult = getGameResult();
  const playerCanDoubleValue = canPlayerDouble();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-4" style={{ backgroundColor: '#e5e4cd' }}>
        <div className="max-w-6xl mx-auto space-y-4">
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 hover:opacity-70 transition-colors" style={{ color: '#5a3217' }}>
            <ArrowLeft className="w-4 h-4" /> <span>Back to Tools</span>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#5a3217' }}>
              {matchState.isMatchStarted ? `Match to ${matchState.targetScore}` : 'Play Against Computer'}
            </h1>
          </div>

          <div className="flex justify-center relative">
            {matchState.isMatchStarted && gameState.gamePhase !== 'pre-match' && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full mr-4">
                <div className="flex flex-col items-center space-y-2">
                  {getCrawfordStatus() && (
                    <div className="text-xs font-bold text-center px-2 py-1 rounded mb-1" style={{ backgroundColor: '#f26222', color: 'white' }}>
                      {getCrawfordStatus()}
                    </div>
                  )}
                  {matchState.useClock && (
                    <div className="w-24 h-10 flex items-center justify-center text-xl font-bold text-white mb-2 rounded-md" style={{ backgroundColor: '#f26222' }}>
                      {gameState.currentPlayer === 'black' && matchState.isGracePeriodActive ? `0:${matchState.gracePeriodCountdown.toString().padStart(2, '0')}` : formatTime(matchState.computerTime)}
                    </div>
                  )}
                  <div className="w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg rounded-md" style={{ backgroundColor: '#5a3217', color: '#e5e4cd' }}>{matchState.computerScore}</div>
                  <div className="w-10 h-10 flex items-center justify-center text-lg font-bold border-2 rounded-md" style={{ backgroundColor: '#e5e4cd', color: '#007e81', borderColor: '#007e81' }}>{matchState.targetScore}</div>
                  <div className="w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg rounded-md" style={{ backgroundColor: '#5a3217', color: '#e5e4cd' }}>{matchState.playerScore}</div>
                   {matchState.useClock && (
                    <div className="w-24 h-10 flex items-center justify-center text-xl font-bold text-white mt-2 rounded-md" style={{ backgroundColor: '#f26222' }}>
                      {gameState.currentPlayer === 'white' && matchState.isGracePeriodActive ? `0:${matchState.gracePeriodCountdown.toString().padStart(2, '0')}` : formatTime(matchState.playerTime)}
                    </div>
                  )}
                </div>
              </div>
            )}
            <BackgammonBoard
              position={gameState.position} bar={gameState.bar} bornOff={gameState.bornOff}
              isPlayerTurn={gameState.currentPlayer === 'white' && gameState.movesRemaining.length > 0 && !hasBlockedBarCheckers && !playerIsStuck && !isComputerOfferingDouble && gameState.gamePhase !== 'pre-match'}
              playerColor="white" doublingCube={{ value: gameState.cubeValue, owner: gameState.cubeOwner, disabled: !playerCanDoubleValue }}
              showControls={showGameControls} showDoubleButton={playerCanDoubleValue} onRollDice={handleRollDice} onOfferDouble={handleOfferDouble} rollDisabled={rollDisabled}
              diceDisplay={createModifiedDiceDisplay()} onUndoMoves={handleUndoLastMove} onConfirmTurn={handleConfirmTurn} showUndo={showUndo} showEndTurn={showEndTurn} endTurnReady={endTurnReady}
              onCheckerClick={handleCheckerClick} isComputerOfferingDouble={isComputerOfferingDouble} doubledCubeValue={gameState.cubeValue * 2} onTakeDouble={handlePlayerTakesDouble} onPassDouble={handlePlayerPassesDouble}
            />
          </div>

          <div className="text-center">
            <Button onClick={startNewMatch} variant="outline" className="px-8 py-2" style={{ borderColor: '#5a3217', color: '#5a3217' }}>New Match</Button>
          </div>

          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader><CardTitle style={{ color: '#5a3217' }}>GAME LOG</CardTitle></CardHeader>
            <CardContent><div className="space-y-1 h-24 overflow-y-auto text-sm" style={{ color: '#5a3217' }}>{gameLog.map((entry, index) => <div key={index}>{entry}</div>)}</div></CardContent>
          </Card>

          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader><CardTitle style={{ color: '#5a3217' }}>HOW TO PLAY</CardTitle></CardHeader>
            <CardContent><ul className="text-sm space-y-1" style={{ color: '#5a3217' }}>
                <li>• Select match length and clock options, then click "Start Match" to begin.</li>
                <li>• Click "ROLL" to begin and see who goes first.</li>
                <li>• Drag a white checker to a valid destination point.</li>
                <li>• The game will automatically handle turns and computer moves.</li>
                <li>• Get all 15 checkers to the bear-off area to win!</li>
                <li>• Click the "DOUBLE" button to offer a double. (Not available during Crawford game).</li>
            </ul></CardContent>
          </Card>
        </div>

        {gameState.gamePhase === 'pre-match' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg shadow-2xl text-center max-w-md" style={{ backgroundColor: '#e5e4cd' }}>
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#5a3217' }}>Start a New Match</h2>
              <div className="mb-6 space-y-2">
                <label htmlFor="match-length" className="text-lg block mb-2" style={{ color: '#5a3217' }}>Match Length (Points):</label>
                <Select id="match-length" defaultValue="1" onValueChange={(v) => setMatchState(s => ({ ...s, targetScore: parseInt(v) }))}>
                  <SelectTrigger className="w-full text-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Point</SelectItem><SelectItem value="3">3 Points</SelectItem><SelectItem value="5">5 Points</SelectItem>
                    <SelectItem value="7">7 Points</SelectItem><SelectItem value="9">9 Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Checkbox id="use-clock" checked={matchState.useClock} onCheckedChange={(checked) => setMatchState(s => ({ ...s, useClock: checked }))} />
                <label htmlFor="use-clock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" style={{ color: '#5a3217' }}>Use Match Clock (2 min/point)</label>
              </div>
              <Button onClick={handleStartMatch} className="mt-4 px-8 py-3 text-lg font-semibold" style={{ backgroundColor: '#f26222', color: 'white' }}>Start Match</Button>
            </div>
          </div>
        )}

        {matchState.matchWinner && gameResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg shadow-2xl text-center max-w-md" style={{ backgroundColor: '#e5e4cd' }}>
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#5a3217' }}>
                {timeLossWinner ? (timeLossWinner === 'white' ? 'You Win on Time!' : 'Computer Wins on Time!') : (gameResult.playerWon ? 'Congrats, you beat the computer!' : 'Unlucky, the computer beat you')}
              </h2>
              <p className="text-xl mb-4" style={{ color: '#5a3217' }}>
                {timeLossWinner ? `${timeLossWinner === 'white' ? 'Computer' : 'You'} ran out of time. ${gameResult.finalScore} point${gameResult.finalScore !== 1 ? 's' : ''}.` : `Final game: ${gameResult.gameType} for ${gameResult.finalScore} point${gameResult.finalScore !== 1 ? 's' : ''}.`}
              </p>
              <div className="text-lg mb-6 p-3 rounded-md" style={{ backgroundColor: 'rgba(90, 50, 23, 0.1)' }}>
                <h3 className="font-bold uppercase text-sm" style={{ color: '#5a3217'}}>Final Match Score</h3>
                <p className="text-2xl font-bold" style={{ color: '#5a3217' }}>You {matchState.playerScore} - {matchState.computerScore} Computer</p>
              </div>
              <>
                <h3 className="text-2xl font-bold mt-4" style={{ color: '#f26222' }}>{matchState.matchWinner === 'white' ? 'You won the match!' : 'The computer won the match!'}</h3>
                <Button onClick={startNewMatch} className="mt-4 px-8 py-3 text-lg font-semibold" style={{ backgroundColor: '#f26222', color: 'white' }}>New Match</Button>
              </>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}