'use client';

import { getPasswordStrength } from '@/lib/utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(strength.score / 6) * 100}%`,
              backgroundColor: strength.color,
            }}
          />
        </div>
        <span
          className="text-sm"
          style={{ color: strength.color }}
        >
          {strength.label}
        </span>
      </div>
    </div>
  );
} 