
import React, { useState, useEffect } from "react";
import { PipTest } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Target, Clock, Award, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Stats() {
  const [tests, setTests] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setIsLoading(true);
    const data = await PipTest.list("-created_date", 100);
    setTests(data);
    setIsLoading(false);
  };

  const getFilteredTests = () => {
    let filtered = tests;

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(test => test.difficulty === difficultyFilter);
    }

    if (timeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(test => new Date(test.created_date) >= filterDate);
    }

    return filtered;
  };

  const filteredTests = getFilteredTests();

  const getOverallStats = () => {
    if (filteredTests.length === 0) return { accuracy: 0, avgTime: 0, total: 0, bestStreak: 0 };

    const correct = filteredTests.filter(test => test.is_correct).length;
    const totalTime = filteredTests.reduce((sum, test) => sum + test.time_taken, 0);
    
    // Calculate best streak
    let currentStreak = 0;
    let bestStreak = 0;
    
    // Reverse the array to correctly calculate streaks for the most recent tests first
    // Note: This modifies the array temporarily or makes a copy. If the order of filteredTests is critical elsewhere, a copy should be made.
    // However, for streak calculation, processing from most recent backwards is typical.
    // The previous implementation used reverse() on the original filteredTests, which is fine for this scope.
    const reversedFilteredTests = [...filteredTests].reverse(); 

    for (const test of reversedFilteredTests) {
      if (test.is_correct) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return {
      accuracy: Math.round((correct / filteredTests.length) * 100),
      avgTime: Math.round(totalTime / filteredTests.length),
      total: filteredTests.length,
      bestStreak
    };
  };

  const getPerformanceByDifficulty = () => {
    const grouped = filteredTests.reduce((acc, test) => {
      if (!acc[test.difficulty]) {
        acc[test.difficulty] = { correct: 0, total: 0, timeSum: 0 };
      }
      acc[test.difficulty].total++;
      acc[test.difficulty].timeSum += test.time_taken;
      if (test.is_correct) acc[test.difficulty].correct++;
      return acc;
    }, {});

    return Object.entries(grouped).map(([difficulty, data]) => ({
      difficulty,
      accuracy: Math.round((data.correct / data.total) * 100),
      avgTime: Math.round(data.timeSum / data.total),
      total: data.total
    }));
  };

  const getProgressOverTime = () => {
    const grouped = filteredTests.reduce((acc, test) => {
      const date = format(new Date(test.created_date), 'MMM dd');
      if (!acc[date]) {
        acc[date] = { correct: 0, total: 0 };
      }
      acc[date].total++;
      if (test.is_correct) acc[date].correct++;
      return acc;
    }, {});

    // Sort by date to ensure correct progression on the chart
    const sortedGrouped = Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));

    return sortedGrouped
      .map(([date, data]) => ({
        date,
        accuracy: Math.round((data.correct / data.total) * 100),
        total: data.total
      }))
      .slice(0, 10); // Still slice to 10 for consistency, assuming sorting is before slicing for the "latest" 10
  };

  const overallStats = getOverallStats();
  const performanceByDifficulty = getPerformanceByDifficulty();
  const progressData = getProgressOverTime();

  if (isLoading) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: '#e5e4cd' }}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded w-64" style={{ backgroundColor: '#9fd3ba' }}></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded" style={{ backgroundColor: '#9fd3ba' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#e5e4cd' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#6c3b17' }}>Performance Statistics</h1>
            <p className="mt-1" style={{ color: '#6c3b17' }}>Track your pip counting progress</p>
          </div>
          
          <div className="flex gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32" style={{ backgroundColor: '#9fd3ba', borderColor: '#6c3b17' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-36" style={{ backgroundColor: '#9fd3ba', borderColor: '#6c3b17' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#6c3b17' }}>Overall Accuracy</CardTitle>
              <Target className="h-4 w-4" style={{ color: '#f26222' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#6c3b17' }}>{overallStats.accuracy}%</div>
              <p className="text-xs" style={{ color: '#6c3b17' }}>
                {filteredTests.filter(t => t.is_correct).length}/{overallStats.total} correct
              </p>
            </CardContent>
          </Card>
          
          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#6c3b17' }}>Average Time</CardTitle>
              <Clock className="h-4 w-4" style={{ color: '#f26222' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#6c3b17' }}>{overallStats.avgTime}s</div>
              <p className="text-xs" style={{ color: '#6c3b17' }}>per test</p>
            </CardContent>
          </Card>
          
          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#6c3b17' }}>Best Streak</CardTitle>
              <Award className="h-4 w-4" style={{ color: '#f26222' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#6c3b17' }}>{overallStats.bestStreak}</div>
              <p className="text-xs" style={{ color: '#6c3b17' }}>correct in a row</p>
            </CardContent>
          </Card>
          
          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#6c3b17' }}>Total Tests</CardTitle>
              <Calendar className="h-4 w-4" style={{ color: '#f26222' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#6c3b17' }}>{overallStats.total}</div>
              <p className="text-xs" style={{ color: '#6c3b17' }}>completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Performance by Difficulty */}
          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader>
              <CardTitle style={{ color: '#6c3b17' }}>Performance by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceByDifficulty}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#f26222" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Progress Over Time */}
          <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
            <CardHeader>
              <CardTitle style={{ color: '#6c3b17' }}>Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#007e81" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tests */}
        <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
          <CardHeader>
            <CardTitle style={{ color: '#6c3b17' }}>Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTests.slice(0, 10).map((test, index) => (
                <div key={test.id} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgba(229, 228, 205, 0.5)' }}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${test.is_correct ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <div className="font-medium" style={{ color: '#6c3b17' }}>
                        {test.is_correct ? 'Correct' : 'Incorrect'}
                      </div>
                      <div className="text-sm" style={{ color: '#6c3b17' }}>
                        {format(new Date(test.created_date), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" style={{ borderColor: '#f26222', color: '#f26222' }}>
                      {test.difficulty}
                    </Badge>
                    <div className="text-sm" style={{ color: '#6c3b17' }}>
                      {test.user_answer} / {test.correct_pip_count}
                    </div>
                    <div className="text-sm" style={{ color: '#6c3b17' }}>
                      {test.time_taken}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
