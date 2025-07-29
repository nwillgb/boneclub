
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TestInterface({ 
  currentPosition, 
  correctAnswer, 
  onSubmitAnswer, 
  onNewPosition,
  difficulty,
  setDifficulty,
  showHint = false 
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (!isAnswered) {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, startTime]);

  const handleSubmit = () => {
    const answer = parseInt(userAnswer);
    const isCorrect = answer === correctAnswer;
    const result = {
      answer,
      correct: correctAnswer,
      isCorrect,
      timeElapsed
    };

    setLastResult(result);
    setIsAnswered(true);
    onSubmitAnswer(result);
  };

  const handleNewPosition = () => {
    setUserAnswer("");
    setIsAnswered(false);
    setLastResult(null);
    setTimeElapsed(0);
    setStartTime(Date.now());
    onNewPosition();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHintText = () => {
    if (!showHint) return "";
    
    const hints = [
      "Start from the highest points and work your way down",
      "Remember: distance × number of checkers for each point",
      "Don't forget checkers on the bar count as 25 points each",
      "Group similar points together for faster calculation"
    ];
    
    return hints[Math.floor(Math.random() * hints.length)];
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="elegant-shadow bg-bone-color border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7601b4713_pipmaster.png" 
                alt="Pipmaster" 
                className="w-8 h-8"
              />
              <span style={{ color: '#5a3217' }} className="uppercase">PIP COUNT CHALLENGE</span>
            </span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50 uppercase">
                {difficulty}
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-teal-600">
                <Timer className="w-4 h-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase" style={{ color: '#5a3217' }}>
                DIFFICULTY LEVEL
              </label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="border-teal-300 focus:border-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase" style={{ color: '#5a3217' }}>
                YOUR ANSWER
              </label>
              <Input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter pip count"
                disabled={isAnswered}
                className="text-lg font-semibold border-teal-300 focus:border-orange-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase" style={{ color: '#5a3217' }}>
                ACTION
              </label>
              <div className="flex space-x-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer || isAnswered}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-bone-color"
                >
                  Submit
                </Button>
                <Button
                  onClick={handleNewPosition}
                  variant="outline"
                  className="flex-1 border-teal-500 text-teal-700 hover:bg-teal-50"
                >
                  New Position
                </Button>
              </div>
            </div>
          </div>
          
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200"
            >
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-teal-600" />
                <span className="text-sm text-teal-800 font-medium uppercase">HINT:</span>
              </div>
              <p className="text-sm text-teal-700 mt-1">{getHintText()}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className={`elegant-shadow bg-bone-color border-0 ${lastResult.isCorrect ? 'ring-2 ring-teal-500' : 'ring-2 ring-orange-500'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  {lastResult.isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-teal-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-orange-600" />
                  )}
                  
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold uppercase ${lastResult.isCorrect ? 'text-teal-800' : 'text-orange-800'}`}>
                      {lastResult.isCorrect ? 'CORRECT!' : 'INCORRECT'}
                    </h3>
                    <div className="flex items-center space-x-6 mt-2 text-sm" style={{ color: '#5a3217' }}>
                      <span>YOUR ANSWER: <strong>{lastResult.answer}</strong></span>
                      <span>CORRECT ANSWER: <strong>{lastResult.correct}</strong></span>
                      <span>TIME: <strong>{formatTime(lastResult.timeElapsed)}</strong></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
