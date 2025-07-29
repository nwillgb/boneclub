import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { DragDropContext } from '@hello-pangea/dnd';
import BackgammonBoard from '../components/backgammon/BackgammonBoard';

const STARTING_POSITION = {
  24: { color: 'white', count: 2 },
  13: { color: 'white', count: 5 },
  8: { color: 'white', count: 3 },
  6: { color: 'white', count: 5 },
  1: { color: 'black', count: 2 },
  12: { color: 'black', count: 5 },
  17: { color: 'black', count: 3 },
  19: { color: 'black', count: 5 }
};

const OPENING_MOVES = {
  '1,2': [ { name: '24/23 13/11', description: 'Split your back checkers and bring one checker down.', points: [23, 11] }, { name: '6/5 13/11', description: 'If you wish to gamble, slotting your 5-point and bringing one down is another option.', points: [5, 11] } ],
  '1,3': [ { name: '8/5 6/5', description: 'This is the best opening roll. You should secure your 5-point. Do not consider any other moves for this roll.', points: [5] } ],
  '2,3': [ { name: '24/21 13/11', description: 'Split your back checkers 3 and bring a checker down from the midpoint.', points: [21, 11] } ],
  '1,4': [ { name: '24/23 13/9', description: 'Split the back checkers and bring one checker down from the midpoint.', points: [23, 9] }, { name: '6/5 13/9', description: 'If you wish to gamble, slotting your 5-point and bringing one down is another option.', points: [5, 9] } ],
  '2,4': [ { name: '8/4 6/4', description: 'The best move is to secure your 4-point.', points: [4] } ],
  '3,4': [ { name: '24/21 13/9', description: 'The best based on computerised rollout. Splits the back checkers and brings down a builder that can be used to form points further along the board on subsequent rolls.', points: [21, 9] } ],
  '1,5': [ { name: '24/23 13/8', description: 'Split the back checkers and bring one checker down from the midpoint.', points: [23, 8] }, { name: '6/5 13/8', description: 'If you wish to gamble, slotting your 5-point and bringing one down is another option.', points: [5, 8] } ],
  '2,5': [ { name: '24/22 13/8', description: 'Has the best results based on computerised rollout. Splits the back pair, leaving them relatively unlikely to be hit, but in position to form an advanced anchor.', points: [22, 8] } ],
  '3,5': [ { name: '8/3 6/3', description: 'The best move is to secure your 3-point.', points: [3] } ],
  '4,5': [ { name: '24/20 13/8', description: 'The best option for this roll, based on rollouts. It\'s a balanced play, creating opportunities on both sides of the board.', points: [20, 8] } ],
  '1,6': [ { name: '13/7 8/7', description: 'The third best opening roll. The only option worth considering is to secure your bar point.', points: [7] } ],
  '2,6': [ { name: '24/18 13/11', description: 'By far the most popular move for this roll. This is because it advances checkers on both sides of the board.', points: [18, 11] } ],
  '3,6': [ { name: '24/18 13/10', description: 'By far the most popular move for this roll. This is because it advances checkers on both sides of the board.', points: [18, 10] } ],
  '4,6': [ { name: '24/14', description: 'Computerised rollouts confirm that the best move is to make the 24/14 running play.', points: [14] } ],
  '5,6': [ { name: '24/18 18/13', description: 'Rollouts confirm that the best move is to run one of your back checkers to the midpoint. This move is known as the Lovers Leap.', points: [13] } ]
};

export default function OpeningBook() {
  const [dice, setDice] = useState([0, 0]);
  const [boardPosition, setBoardPosition] = useState(JSON.parse(JSON.stringify(STARTING_POSITION)));
  const [playerMoves, setPlayerMoves] = useState([]);
  const [gameState, setGameState] = useState('waiting');
  const [feedback, setFeedback] = useState(null);
  const [movesRemaining, setMovesRemaining] = useState([]);
  const [showingReveal, setShowingReveal] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  
  useEffect(() => {
    if (gameState === 'playing' && movesRemaining.length === 0 && playerMoves.length > 0) {
      checkPlayerMoves();
    }
  }, [movesRemaining, gameState, playerMoves]);

  const rollDice = () => {
    let die1, die2;
    do {
      die1 = Math.floor(Math.random() * 6) + 1;
      die2 = Math.floor(Math.random() * 6) + 1;
    } while (die1 === die2);

    const sortedDice = [die1, die2].sort((a, b) => a - b);
    setDice(sortedDice);
    setBoardPosition(JSON.parse(JSON.stringify(STARTING_POSITION)));
    setPlayerMoves([]);
    setGameState('playing');
    setFeedback(null);
    setMovesRemaining([...sortedDice]);
    setShowingReveal(false);
    setRevealComplete(false);
  };

  const handleNewOpening = () => {
    let die1, die2;
    do {
      die1 = Math.floor(Math.random() * 6) + 1;
      die2 = Math.floor(Math.random() * 6) + 1;
    } while (die1 === die2);

    const sortedDice = [die1, die2].sort((a, b) => a - b);
    setDice(sortedDice);
    setBoardPosition(JSON.parse(JSON.stringify(STARTING_POSITION)));
    setPlayerMoves([]);
    setGameState('playing');
    setFeedback(null);
    setMovesRemaining([...sortedDice]);
    setShowingReveal(false);
    setRevealComplete(false);
  };

  const getDiceKey = () => {
    if (dice[0] === 0) return null;
    const sortedDice = [...dice].sort((a, b) => a - b);
    return `${sortedDice[0]},${sortedDice[1]}`;
  };

  const getCurrentMoves = () => {
    const key = getDiceKey();
    return OPENING_MOVES[key] || [];
  };

  const getValidMoves = (position, diceValues) => {
    const moves = [];
    if (diceValues.length === 0) return moves;

    for (let from = 1; from <= 24; from++) {
      if (position[from]?.color === 'white') {
        for (const die of diceValues) {
          const to = from - die;
          if (to >= 1) {
            const targetPoint = position[to];
            if (!targetPoint || targetPoint.color === 'white' || targetPoint.count === 1) {
              moves.push({ from, to, die });
            }
          }
        }
      }
    }
    return moves;
  };

  const executeMove = (move) => {
    setBoardPosition(prev => {
      const newPosition = JSON.parse(JSON.stringify(prev));
      const { from, to } = move;

      newPosition[from].count--;
      if (newPosition[from].count === 0) delete newPosition[from];

      if (!newPosition[to]) newPosition[to] = { color: 'white', count: 0 };
      newPosition[to].count++;

      return newPosition;
    });

    setPlayerMoves(prev => [...prev, move]);
    setMovesRemaining(prev => {
      const newRemaining = [...prev];
      const dieIndex = newRemaining.indexOf(move.die);
      if (dieIndex > -1) newRemaining.splice(dieIndex, 1);
      return newRemaining;
    });
  };

  const getHighestDiceMove = (from) => {
    if (gameState !== 'playing' || movesRemaining.length === 0 || showingReveal) {
      return null;
    }
    
    const validMoves = getValidMoves(boardPosition, movesRemaining);
    const singleDieMoves = validMoves.filter(move => move.from === from);

    if (singleDieMoves.length === 0) return null;

    const sortedMoves = singleDieMoves.sort((a, b) => b.die - a.die);
    return sortedMoves[0];
  };

  const handleCheckerClick = (from) => {
    const bestMove = getHighestDiceMove(from);
    if (bestMove) {
      executeMove(bestMove);
    }
  };

  const checkPlayerMoves = () => {
    const correctMoves = getCurrentMoves();
    const playerMoveSet = new Set(playerMoves.map(m => `${m.from}/${m.to}`));
    let isCorrect = false;
    let correctMoveIndex = -1;

    for (let i = 0; i < correctMoves.length; i++) {
      const correctMove = correctMoves[i];
      const correctMoveSegments = correctMove.name.split(' '); 
      const correctMoveSet = new Set(correctMoveSegments);
      
      if (playerMoveSet.size === correctMoveSet.size && [...playerMoveSet].every(move => correctMoveSet.has(move))) {
        isCorrect = true;
        correctMoveIndex = i;
        break;
      }
    }

    setGameState('completed');
    setFeedback({
      isCorrect,
      correctMoveIndex,
      playerMoves: Array.from(playerMoveSet).sort().join(' '),
      correctMoves: correctMoves
    });
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || gameState !== 'playing' || movesRemaining.length === 0) return;

    let from;
    if (source.droppableId.startsWith('point-')) {
      from = parseInt(source.droppableId.replace('point-', ''));
    } else {
      return;
    }

    let to;
    if (destination.droppableId.startsWith('point-')) {
      to = parseInt(destination.droppableId.replace('point-', ''));
    } else {
      return;
    }
    
    const validMoves = getValidMoves(boardPosition, movesRemaining);
    const move = validMoves.find(m => m.from === from && m.to === to);
    
    if (move) {
      executeMove(move);
    }
  };

  const resetPractice = () => {
    setDice([0, 0]);
    setBoardPosition(JSON.parse(JSON.stringify(STARTING_POSITION)));
    setPlayerMoves([]);
    setGameState('waiting');
    setFeedback(null);
    setMovesRemaining([]);
    setShowingReveal(false);
    setRevealComplete(false);
  };

  const tryAgain = () => {
    setBoardPosition(JSON.parse(JSON.stringify(STARTING_POSITION)));
    setPlayerMoves([]);
    setGameState('playing');
    setFeedback(null);
    setMovesRemaining([...dice]);
    setShowingReveal(false);
    setRevealComplete(false);
  };

  const handleReveal = () => {
    if (!feedback || feedback.isCorrect) return;
    
    const correctMoves = getCurrentMoves();
    if (correctMoves.length === 0) return;

    setShowingReveal(true);
    setBoardPosition(JSON.parse(JSON.stringify(STARTING_POSITION)));
    
    const correctMove = correctMoves[0];
    const moveSequence = correctMove.name.split(' ');
    
    executeRevealSequence(moveSequence, 0);
  };

  const executeRevealSequence = (moveSequence, index) => {
    if (index >= moveSequence.length) {
      setRevealComplete(true);
      return;
    }

    setTimeout(() => {
      const moveNotation = moveSequence[index];
      const [fromStr, toStr] = moveNotation.split('/');
      const from = parseInt(fromStr);
      const to = parseInt(toStr);
      
      setBoardPosition(prev => {
        const newPosition = JSON.parse(JSON.stringify(prev));
        
        if (newPosition[from]) {
          newPosition[from].count--;
          if (newPosition[from].count === 0) delete newPosition[from];
        }
        
        if (!newPosition[to]) newPosition[to] = { color: 'white', count: 0 };
        newPosition[to].count++;
        
        return newPosition;
      });
      
      executeRevealSequence(moveSequence, index + 1);
    }, 800);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-4" style={{ backgroundColor: '#e5e4cd' }}>
        <div className="max-w-6xl mx-auto space-y-4">
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 hover:opacity-70 transition-colors" style={{ color: '#5a3217' }}>
            <ArrowLeft className="w-4 h-4" /> <span>Back to Tools</span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl mb-2 font-bold" style={{ color: '#5a3217' }}>Interactive Opening Practice</h1>
          </div>
          
          <div className="flex justify-center">
            <BackgammonBoard 
              position={boardPosition} 
              isPlayerTurn={gameState === 'playing' && movesRemaining.length > 0 && !showingReveal}
              playerColor="white"
              showControls={gameState === 'waiting'}
              onRollDice={rollDice}
              rollDisabled={false}
              diceDisplay={dice[0] > 0 ? (gameState === 'playing' && movesRemaining.length > 0 ? 
                movesRemaining.map((die, i) => ({ value: die, isUsed: false, playerColor: 'white', id: `remaining-${i}` })) :
                dice.map((die, i) => ({ value: die, isUsed: true, playerColor: 'white', id: `used-${i}` }))
              ) : []}
              showResultControls={gameState === 'completed' && feedback !== null}
              isCorrect={feedback?.isCorrect}
              onTryAgain={feedback?.isCorrect ? handleNewOpening : (revealComplete ? tryAgain : handleReveal)}
              onNewOpening={handleNewOpening}
              showRevealComplete={revealComplete}
              onCheckerClick={handleCheckerClick}
            />
          </div>
          
          {feedback && (
            <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
              <CardHeader><CardTitle style={{ color: '#5a3217' }}>FEEDBACK</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm" style={{ color: '#5a3217' }}>
                  <p>Your move: <strong>{feedback.playerMoves}</strong></p>
                  {feedback.isCorrect && feedback.correctMoves[feedback.correctMoveIndex] && (
                     <div>
                       <p><strong>STRATEGY:</strong></p>
                       <p>{feedback.correctMoves[feedback.correctMoveIndex].description}</p>
                     </div>
                  )}
                  {!feedback.isCorrect && feedback.correctMoves.length > 0 && (
                    <div>
                      <p><strong>RECOMMENDED MOVES:</strong></p>
                      {feedback.correctMoves.map((move, index) => (
                        <div key={index} className="ml-4 mt-1 border-l-2 pl-2 border-orange-400">
                          <p><strong>{move.name}</strong> - {move.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader><CardTitle style={{ color: '#5a3217' }}>HOW TO PRACTICE</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1" style={{ color: '#5a3217' }}>
                <li>• Click "Roll Dice" to get a random opening roll</li>
                <li>• Drag a white checker to a valid destination point</li>
                <li>• Complete both moves to see if you made the optimal play!</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader><CardTitle style={{ color: '#5a3217' }}>OPENING STRATEGY PRINCIPLES</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#5a3217' }}>KEY OBJECTIVES:</h4>
                  <ul className="text-sm space-y-2" style={{ color: '#5a3217' }}>
                    <li>• <strong>MAKE POINTS:</strong> Control territory with two or more checkers</li>
                    <li>• <strong>SPLIT SAFELY:</strong> Divide back checkers to create escape options</li>
                    <li>• <strong>BUILD FLEXIBLY:</strong> Position checkers to make future points</li>
                    <li>• <strong>CONTROL CENTER:</strong> The 5-point and bar-point are most valuable</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#5a3217' }}>POINT VALUES:</h4>
                  <ul className="text-sm space-y-2" style={{ color: '#5a3217' }}>
                    <li>• <strong>5-POINT:</strong> The "golden point" - highest priority</li>
                    <li>• <strong>7-POINT (BAR):</strong> Controls opponent's escape routes</li>
                    <li>• <strong>4-POINT:</strong> Solid foundation for inner board</li>
                    <li>• <strong>20+ POINTS:</strong> Escape positions for back checkers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DragDropContext>
  );
}