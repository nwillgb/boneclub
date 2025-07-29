import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PipTest } from "@/api/entities";
import { DragDropContext } from "@hello-pangea/dnd";
import BackgammonBoard from "../components/backgammon/BackgammonBoard";
import TestInterface from "../components/backgammon/TestInterface";
import PipCalculator from "../components/backgammon/PipCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Clock, Percent, ArrowLeft } from "lucide-react";

export default function Pipmaster() {
  const [currentPosition, setCurrentPosition] = useState({});
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    correct: 0,
    averageTime: 0,
    totalTime: 0
  });
  const [showHint, setShowHint] = useState(false);

  const { calculatePipCount, generateRandomPosition } = PipCalculator();

  const generateNewPosition = () => {
    const position = generateRandomPosition(difficulty);
    const pipCount = calculatePipCount(position, 'white');
    setCurrentPosition(position);
    setCorrectAnswer(pipCount);
  };

  useEffect(() => {
    generateNewPosition();
  }, [difficulty]);

  const handleSubmitAnswer = async (result) => {
    await PipTest.create({
      position_data: currentPosition,
      correct_pip_count: correctAnswer,
      user_answer: result.answer,
      time_taken: result.timeElapsed,
      is_correct: result.isCorrect,
      difficulty: difficulty
    });

    setSessionStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (result.isCorrect ? 1 : 0),
      totalTime: prev.totalTime + result.timeElapsed,
      averageTime: Math.round((prev.totalTime + result.timeElapsed) / (prev.total + 1))
    }));

    if (!result.isCorrect) {
      setShowHint(true);
    }
  };

  const handleNewPosition = () => {
    setShowHint(false);
    generateNewPosition();
  };

  // Dummy drag handler - no actual dragging in pip counting
  const handleDragEnd = (result) => {
    // Do nothing - this is just for pip counting practice
  };

  const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-4" style={{ backgroundColor: '#e5e4cd' }}>
        <div className="max-w-6xl mx-auto space-y-6">
          
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 hover:opacity-70 transition-colors" style={{ color: '#6c3b17' }}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tools</span>
          </Link>
          
          {/* Session Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={{ color: '#6c3b17' }}>Total Tests</CardTitle>
                <Target className="h-4 w-4" style={{ color: '#f26222' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#6c3b17' }}>{sessionStats.total}</div>
              </CardContent>
            </Card>
            
            <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={{ color: '#6c3b17' }}>Accuracy</CardTitle>
                <Percent className="h-4 w-4" style={{ color: '#f26222' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#6c3b17' }}>{accuracy}%</div>
                <p className="text-xs" style={{ color: '#6c3b17' }}>
                  {sessionStats.correct}/{sessionStats.total} correct
                </p>
              </CardContent>
            </Card>
            
            <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={{ color: '#6c3b17' }}>Avg Time</CardTitle>
                <Clock className="h-4 w-4" style={{ color: '#f26222' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#6c3b17' }}>{sessionStats.averageTime}s</div>
              </CardContent>
            </Card>
            
            <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={{ color: '#6c3b17' }}>Difficulty</CardTitle>
                <TrendingUp className="h-4 w-4" style={{ color: '#f26222' }} />
              </CardHeader>
              <CardContent>
                <Badge variant="outline" style={{ color: '#f26222', borderColor: '#f26222', backgroundColor: 'rgba(242, 98, 34, 0.1)' }}>
                  {difficulty}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Test Interface */}
          <TestInterface
            currentPosition={currentPosition}
            correctAnswer={correctAnswer}
            onSubmitAnswer={handleSubmitAnswer}
            onNewPosition={handleNewPosition}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            showHint={showHint}
          />

          {/* Backgammon Board */}
          <BackgammonBoard 
            position={currentPosition} 
            isPlayerTurn={false}
            playerColor="white"
          />

          {/* Instructions */}
          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader>
              <CardTitle style={{ color: '#6c3b17' }}>How to Count Pips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#6c3b17' }}>Basic Rules:</h4>
                  <ul className="text-sm space-y-1" style={{ color: '#6c3b17' }}>
                    <li>• Each checker's pip value = point number × number of checkers</li>
                    <li>• Points are numbered 1-24 from your opponent's perspective</li>
                    <li>• Checkers on the bar count as 25 points each</li>
                    <li>• Borne-off checkers count as 0 points</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#6c3b17' }}>Counting Tips:</h4>
                  <ul className="text-sm space-y-1" style={{ color: '#6c3b17' }}>
                    <li>• Start from the highest points and work your way down</li>
                    <li>• Group similar patterns for faster calculation</li>
                    <li>• Practice mental math shortcuts</li>
                    <li>• Focus on accuracy first, then speed</li>
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