'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Laptop, FolderGit2, Sparkles } from 'lucide-react';

const ONBOARDING_STORAGE_KEY = 'mandarly-onboarding-completed';

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!hasCompletedOnboarding) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const steps = [
    {
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      title: 'Welcome to AI Task Tracker!',
      description: 'Track and manage AI-assisted coding tasks across different environments. Let\'s get you started with a quick tour.',
    },
    {
      icon: <Laptop className="h-12 w-12 text-blue-500" />,
      title: 'Create Your First Task',
      description: 'Start by creating a task. Choose where to run it (local, worktree, or remote), select your AI vendor, and describe what you want to accomplish.',
    },
    {
      icon: <FolderGit2 className="h-12 w-12 text-green-500" />,
      title: 'Organize with Projects',
      description: 'Group related tasks into projects for better organization. Projects help you track tasks across different features or initiatives.',
    },
    {
      icon: <CheckCircle2 className="h-12 w-12 text-purple-500" />,
      title: 'Monitor Progress',
      description: 'Track task status changes, view history, and re-run tasks with modifications. Everything you need to manage your AI-assisted workflows.',
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {currentStepData.icon}
          </div>
          <DialogTitle className="text-center text-xl">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 my-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-primary w-4'
                  : index < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1">
            {currentStep === 0 && (
              <Button variant="ghost" onClick={handleSkip} className="w-full sm:w-auto">
                Skip Tour
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
