import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X } from 'lucide-react';
import { Button } from './button.jsx';
import { cn } from '../../lib/cn.js';

export function DatePicker({ value, onChange, placeholder = 'Select date and time', className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [selectedTime, setSelectedTime] = useState(value ? new Date(value) : null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef(null);
  const inputRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setSelectedTime(date);
    } else {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [value]);

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      
      // Try to open below first, if not enough space, open above
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const pickerHeight = 500; // Approximate height
      
      if (spaceBelow >= pickerHeight || spaceBelow > spaceAbove) {
        // Open below
        setPosition({
          top: rect.bottom + scrollY + 8,
          left: rect.left + scrollX,
        });
      } else {
        // Open above
        setPosition({
          top: rect.top + scrollY - pickerHeight - 8,
          left: rect.left + scrollX,
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatDisplayValue = () => {
    if (!selectedDate) return '';
    const date = selectedDate;
    const time = selectedTime || date;
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selectedTime) {
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
    }
    setSelectedDate(newDate);
    setSelectedTime(newDate);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (type, value) => {
    let date = selectedDate;
    if (!date) {
      date = new Date();
      setSelectedDate(date);
    }
    
    const newDate = new Date(date);
    const numValue = parseInt(value) || 0;
    
    if (type === 'hour') {
      newDate.setHours(Math.min(23, Math.max(0, numValue)));
    } else if (type === 'minute') {
      newDate.setMinutes(Math.min(59, Math.max(0, numValue)));
    }
    
    setSelectedDate(newDate);
    setSelectedTime(newDate);
    onChange(newDate.toISOString());
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    setSelectedTime(null);
    onChange('');
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const today = new Date();
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('relative', className)}>
      <div
        ref={inputRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={selectedDate ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedDate ? formatDisplayValue() : placeholder}
          </span>
        </div>
        {selectedDate && (
          <X
            className="h-4 w-4 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          />
        )}
      </div>

      {isOpen && createPortal(
        <div
          ref={pickerRef}
          className="fixed z-[100] w-[320px] rounded-md border border-border bg-background dark:bg-[#1a1a1a] p-4 shadow-xl"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxHeight: '500px',
            overflowY: 'auto',
          }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(-1)}
              className="h-8 w-8 p-0"
            >
              ‹
            </Button>
            <div className="font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(1)}
              className="h-8 w-8 p-0"
            >
              ›
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    'p-2 rounded-md text-sm hover:bg-accent transition-colors',
                    isToday(day) && 'bg-blue-100 dark:bg-blue-900 font-semibold',
                    isSelected(day) && 'bg-primary text-primary-foreground font-semibold'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Picker */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Time</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={selectedTime ? selectedTime.getHours() : ''}
                  onChange={(e) => handleTimeChange('hour', e.target.value)}
                  className="w-16 h-10 rounded-md border border-input bg-background px-2 text-center text-sm"
                  placeholder="HH"
                />
                <span className="text-muted-foreground">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={selectedTime ? selectedTime.getMinutes() : ''}
                  onChange={(e) => handleTimeChange('minute', e.target.value)}
                  className="w-16 h-10 rounded-md border border-input bg-background px-2 text-center text-sm"
                  placeholder="MM"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const now = new Date();
                  const newDate = selectedDate || now;
                  newDate.setHours(now.getHours());
                  newDate.setMinutes(now.getMinutes());
                  setSelectedDate(newDate);
                  setSelectedTime(newDate);
                  onChange(newDate.toISOString());
                }}
              >
                Now
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
