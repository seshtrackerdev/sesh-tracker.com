import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import './Slider.css';

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ 
  className = '',
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  disabled = false,
  label,
  showValue = false,
  ...props
}, ref) => {
  // Get the current value to display
  const displayValue = value?.[0] ?? defaultValue?.[0] ?? min;
  
  return (
    <div className="slider-container">
      {label && (
        <div className="slider-label-container">
          <label className="slider-label">{label}</label>
          {showValue && <span className="slider-value">{displayValue}</span>}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={`slider-root ${orientation === 'vertical' ? 'slider-vertical' : 'slider-horizontal'} ${className}`}
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        orientation={orientation}
        {...props}
      >
        <SliderPrimitive.Track className="slider-track">
          <SliderPrimitive.Range className="slider-range" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="slider-thumb" aria-label={label} />
      </SliderPrimitive.Root>
    </div>
  );
});

Slider.displayName = 'Slider';

export default Slider; 