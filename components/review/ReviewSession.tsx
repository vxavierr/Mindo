import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMindoStore } from '../../store/useMindoStore';
import { ReviewGrade } from '../../types';
import { ReviewSessionView } from './ReviewSessionView';

// MOCK DATA (In a real app, this comes from useMindoStore selectors)
const mockQuestion = {
  question: "How does 'Overfitting' relate to model complexity?",
  sourceText: "Overfitting occurs when a statistical model fits the training data too closely. This usually happens when the model is too complex relative to the amount of data available, capturing noise rather than the underlying pattern. Generalization is compromised, and the model performs poorly on new data.",
  relevantSegment: "This usually happens when the model is too complex relative to the amount of data available",
  relatedNodes: ['Machine Learning', 'Statistics'],
};

export function ReviewSession() {
  const navigate = useNavigate();
  const { submitReviewGrade, nextReviewQuestion, endReviewSession } = useMindoStore();
  
  // Logic State
  const [step, setStep] = useState<'question' | 'feedback'>('question');
  const [userAnswer, setUserAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const totalQuestions = 3;

  // Logic Handlers
  const handleSubmitAnswer = () => {
    setStep('feedback');
  };

  const handleGrade = (grade: ReviewGrade) => {
    submitReviewGrade('mock-node-id', grade);
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      nextReviewQuestion();
      setStep('question');
      setUserAnswer('');
    } else {
      endReviewSession();
      navigate('/');
    }
  };

  const handleExit = () => {
    endReviewSession();
    navigate('/');
  };

  // Render Presentation Component
  return (
    <ReviewSessionView
      questionData={mockQuestion}
      step={step}
      currentQuestionIndex={currentQuestion}
      totalQuestions={totalQuestions}
      userAnswer={userAnswer}
      onAnswerChange={setUserAnswer}
      onSubmitAnswer={handleSubmitAnswer}
      onGrade={handleGrade}
      onExit={handleExit}
    />
  );
}