import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button.js';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">

      <h1 className="text-6xl font-semibold text-foreground mb-3">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-4">Nothing here</h2>
      
      <p className="text-sm text-muted-text max-w-md mb-8 leading-relaxed">
        That link doesn't go anywhere. It may have moved, or it was never here.
      </p>

      <Link to="/">
        <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Go back
        </Button>
      </Link>
    </div>
  );
};
