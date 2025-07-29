import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, BarChart3, Bot, Construction, Target } from 'lucide-react';

export default function Home() {
  const tools = [
    {
      name: 'PIPMASTER',
      description: 'Test and improve your pip counting speed and accuracy.',
      iconUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7601b4713_pipmaster.png',
      url: createPageUrl('Pipmaster'),
      status: 'active'
    },
    {
      name: 'OPENING BOOK',
      description: 'Learn the best opening moves and their responses.',
      icon: BookOpen,
      url: createPageUrl('OpeningBook'),
      status: 'active'
    },
    {
      name: 'STRATEGIES',
      description: 'Practice strategic moves and positioning concepts.',
      icon: Target,
      url: createPageUrl('Strategies'),
      status: 'active'
    },
    {
      name: 'PLAY VS COMPUTER',
      description: 'Practice your skills against an AI opponent.',
      icon: Bot,
      url: createPageUrl('PlayComputer'),
      status: 'active'
    },
    {
        name: 'MATCH ANALYSIS',
        description: 'Analyze your match performance and equity.',
        icon: BarChart3,
        url: '#',
        status: 'soon'
    },
    {
        name: 'TEST',
        description: 'A new tool for testing features.',
        icon: Construction,
        url: createPageUrl('Test'),
        status: 'active'
    }
  ];

  return (
    <div style={{ backgroundColor: '#e5e4cd' }} className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: '#5a3217' }}>TOOL BOX</h1>
          <p className="text-lg main-text">Select a tool to sharpen your skills.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map(tool => (
            <Link to={tool.status === 'active' ? tool.url : '#'} key={tool.name} className={`${tool.status !== 'active' ? 'cursor-not-allowed' : ''} group`}>
              <Card className="tool-card-bg border-0 h-full group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300 elegant-shadow overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                     {tool.iconUrl ? (
                       <img src={tool.iconUrl} alt={tool.name} className="w-12 h-12" />
                     ) : (
                       <tool.icon className="w-12 h-12 highlight-text" style={{ color: '#f26222' }} />
                     )}
                     {tool.status === 'soon' && <Badge variant="outline" className="border-orange-400 text-orange-700">Coming Soon</Badge>}
                  </div>
                  <CardTitle className="main-text uppercase" style={{ color: '#5a3217' }}>{tool.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="main-text" style={{ color: '#5a3217' }}>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}