import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw } from 'lucide-react';

const DiceIcon = ({ value }) => {
  const icons = {
    1: Dice1, 2: Dice2, 3: Dice3, 4: Dice4, 5: Dice5, 6: Dice6
  };
  const Icon = icons[value];
  return <Icon className="w-6 h-6" />;
};

export default function GameInterface({ 
  gameState, 
  onRollDice, 
  onEndTurn, 
  onNewGame,
  selectedPoint,
  availableMoves 
}) {
  return (
    <div className="space-y-4">
      <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
        <CardHeader>
          <CardTitle style={{ color: '#5a3217' }}>GAME STATUS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge 
                variant="outline" 
                className={gameState.currentPlayer === 'white' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'}
              >
                {gameState.currentPlayer === 'white' ? 'Your Turn' : 'Computer Turn'}
              </Badge>
            </div>
            
            <div className="flex space-x-2">
              {gameState.dice[0] > 0 && (
                <div className="p-2 rounded" style={{ backgroundColor: '#f26222' }}>
                  <DiceIcon value={gameState.dice[0]} />
                </div>
              )}
              {gameState.dice[1] > 0 && (
                <div className="p-2 rounded" style={{ backgroundColor: '#f26222' }}>
                  <DiceIcon value={gameState.dice[1]} />
                </div>
              )}
            </div>
            
            <div className="space-x-2">
              <Button 
                onClick={onRollDice}
                disabled={gameState.currentPlayer !== 'white' || gameState.dice[0] > 0}
                style={{ backgroundColor: '#f26222' }}
                className="hover:opacity-90 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Roll
              </Button>
              <Button 
                onClick={onNewGame}
                variant="outline"
                style={{ borderColor: '#5a3217', color: '#5a3217' }}
              >
                New Game
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}