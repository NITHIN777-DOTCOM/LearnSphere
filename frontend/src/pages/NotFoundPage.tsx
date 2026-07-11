import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button.js';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-danger/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="bg-danger/10 border border-danger/20 p-4 rounded-full mb-6">
        <HelpCircle className="w-16 h-16 text-danger animate-pulse" />
      </div>

      <h1 className="text-6xl font-extrabold text-white tracking-tight mb-3">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h2>
      
      <p className="text-sm text-muted-text max-w-md mb-8 leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track.
      </p>

      <Link to="/">
        <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Safety
        </Button>
      </Link>
    </div>
  );
};
