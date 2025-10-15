import React from 'react';
import { cn } from '@/lib/utils';

interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, selected, onSelect, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-3 border border-gray-700 rounded-lg bg-black/50 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        <div className="text-center text-white">
          Календарь
        </div>
      </div>
    );
  }
);

Calendar.displayName = 'Calendar';

export { Calendar };
