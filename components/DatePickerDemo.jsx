import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerDemo({ onDateChange }) {
  // Use current date, but without time shift issues
  const [date, setDate] = useState(new Date().setHours(0, 0, 0, 0)); // Set to midnight of the local machine

  // Update the parent component whenever a date is selected
  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    if (onDateChange) {
      onDateChange(selectedDate); // Notify parent with the selected date
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect} // Update the selected date and notify parent
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
