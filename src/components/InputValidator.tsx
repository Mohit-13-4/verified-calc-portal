
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ValidatedInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 0.01,
  placeholder,
  required = false,
  className = ""
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    
    // Validate the input
    if (isNaN(newValue)) {
      onChange(0);
      return;
    }
    
    if (min !== undefined && newValue < min) {
      onChange(min);
      return;
    }
    
    if (max !== undefined && newValue > max) {
      onChange(max);
      return;
    }
    
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={label} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={label}
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        required={required}
        className="w-full"
      />
      {min !== undefined && (
        <p className="text-xs text-gray-500">
          Minimum value: {min}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;
