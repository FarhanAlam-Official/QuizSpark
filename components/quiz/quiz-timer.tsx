'use client';

import { useState, useEffect, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, Pause, Play } from 'lucide-react';

interface QuizTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  onTick?: (timeLeft: number) => void;
  autoStart?: boolean;
  showProgress?: boolean;
}

export function QuizTimer({
  duration,
  onTimeUp,
  onTick,
  autoStart = true,
  showProgress = true,
}: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getProgressValue = useCallback((): number => {
    return ((duration - timeLeft) / duration) * 100;
  }, [duration, timeLeft]);

  const getProgressColor = useCallback((): string => {
    const percentage = (timeLeft / duration) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [timeLeft, duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          onTick?.(newTime);
          
          if (newTime <= 0) {
            setIsRunning(false);
            onTimeUp();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, timeLeft, onTimeUp, onTick]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const reset = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsPaused(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="text-lg font-mono font-bold">
            {formatTime(timeLeft)}
          </span>
        </div>
        
        <div className="flex gap-2">
          {isRunning && (
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              className="gap-1"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          
          {!isRunning && timeLeft === duration && (
            <Button size="sm" onClick={start}>
              Start Timer
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      {showProgress && (
        <div className="space-y-2">
          <Progress 
            value={getProgressValue()} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0:00</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {timeLeft <= 10 && timeLeft > 0 && (
        <div className="text-center">
          <span className="text-red-500 font-bold animate-pulse">
            Time running out!
          </span>
        </div>
      )}
    </div>
  );
}