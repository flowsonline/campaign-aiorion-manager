import React from 'react';

export default function StepIndicator({ currentStep, totalSteps = 7 }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <div className="step-indicator">
      {steps.map((step) => (
        <div
          key={step}
          className={`step-chip ${
            step === currentStep ? 'active' : step < currentStep ? 'completed' : ''
          }`}
        >
          Step {step}
        </div>
      ))}
    </div>
  );
}
