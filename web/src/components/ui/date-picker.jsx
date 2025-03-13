import * as React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "./input";
import { cn } from "../../lib/utils";
import { format } from "date-fns";

/**
 * A custom DatePicker component that can be used as a replacement for Semi UI's DatePicker
 * 
 * @param {Object} props - Component props
 * @param {Date|null} props.value - The selected date
 * @param {function} props.onChange - Callback fired when the value changes
 * @param {string} props.format - Date format string (default: "yyyy-MM-dd")
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether the datepicker is disabled
 * @param {string} props.className - Additional CSS class names
 * @param {boolean} props.showTime - Whether to show time picker (not implemented yet)
 */
const DatePicker = ({
  value,
  onChange,
  format: formatStr = "yyyy-MM-dd",
  placeholder = "Select date",
  disabled = false,
  className,
  showTime = false,
  ...props
}) => {
  const [date, setDate] = React.useState(value || null);

  // Function to format the date for display
  const formatDate = (date) => {
    if (!date) return "";
    return format(date, formatStr);
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (onChange) {
      // If showTime is enabled, we would need to preserve time here
      onChange(newDate);
    }
  };

  // If value changes externally, update the internal state
  React.useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  // Handle direct input changes (user typing)
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    if (!inputValue) {
      setDate(null);
      if (onChange) onChange(null);
      return;
    }

    // Here you could add date parsing logic if needed
    // For simplicity, we're not implementing that now
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          initialFocus
        />
        {/* If showTime is true, we would add time picker here */}
      </PopoverContent>
    </Popover>
  );
};

/**
 * A variant of DatePicker that uses an Input component instead of a button
 */
const DatePickerInput = ({
  value,
  onChange,
  format: formatStr = "yyyy-MM-dd",
  placeholder = "Select date",
  disabled = false,
  className,
  ...props
}) => {
  const [date, setDate] = React.useState(value || null);

  // Function to format the date for display
  const formatDate = (date) => {
    if (!date) return "";
    return format(date, formatStr);
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  // If value changes externally, update the internal state
  React.useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={date ? formatDate(date) : ""}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            readOnly
            {...props}
          />
          <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

/**
 * A DateTimePicker component that allows selection of both date and time
 * This is a placeholder implementation and would need enhancement
 */
const DateTimePicker = ({
  value,
  onChange,
  format: formatStr = "yyyy-MM-dd HH:mm:ss",
  placeholder = "Select date and time",
  disabled = false,
  className,
  ...props
}) => {
  const [date, setDate] = React.useState(value || null);

  // Function to format the date for display
  const formatDate = (date) => {
    if (!date) return "";
    return format(date, formatStr);
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    // Clone the date to avoid mutations
    const updatedDate = newDate ? new Date(newDate) : null;
    
    // If we already have a date with time information, preserve the time
    if (updatedDate && date) {
      updatedDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
    }
    
    setDate(updatedDate);
    if (onChange) {
      onChange(updatedDate);
    }
  };

  // Handle time change
  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    if (!timeValue || !date) return;

    // Parse time value (HH:mm format)
    const [hours, minutes] = timeValue.split(':').map(Number);
    
    // Create a new date with the updated time
    const updatedDate = new Date(date);
    updatedDate.setHours(hours || 0, minutes || 0, 0);
    
    setDate(updatedDate);
    if (onChange) {
      onChange(updatedDate);
    }
  };

  // If value changes externally, update the internal state
  React.useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  return (
    <div className="flex space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatDate(date) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
          <div className="p-3 border-t border-border">
            <Input
              type="time"
              onChange={handleTimeChange}
              value={date ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` : ''}
              disabled={!date}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Export the component
export { DatePicker, DatePickerInput, DateTimePicker }; 