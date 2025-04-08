'use client';

import React, { useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Assuming DatePicker and potentially Label components exist
// import { DatePicker } from '@/components/ui/date-picker';
// import { Label } from '@/components/ui/label';

type TimePeriod = 'last7days' | 'last30days' | 'last90days' | 'alltime' | 'custom';

interface TimePeriodSelectorProps {
  initialPeriod?: TimePeriod;
  onPeriodChange: (period: TimePeriod, startDate?: Date, endDate?: Date) => void;
}

export function TimePeriodSelector({ 
  initialPeriod = 'last30days', 
  onPeriodChange 
}: TimePeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(initialPeriod);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const handlePeriodChange = useCallback((value: string) => {
    const newPeriod = value as TimePeriod;
    setSelectedPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      onPeriodChange(newPeriod);
    } else if (customStartDate && customEndDate) {
      onPeriodChange('custom', customStartDate, customEndDate);
    }
  }, [onPeriodChange, customStartDate, customEndDate]);

  // Placeholder for DatePicker integration
  // const handleDateChange = useCallback(() => {
  //   if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
  //     onPeriodChange('custom', customStartDate, customEndDate);
  //   }
  // }, [selectedPeriod, customStartDate, customEndDate, onPeriodChange]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select time period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
          <SelectItem value="last30days">Last 30 Days</SelectItem>
          <SelectItem value="last90days">Last 90 Days</SelectItem>
          <SelectItem value="alltime">All Time</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {/* Placeholder for Custom Date Range Pickers */}
      {/* {selectedPeriod === 'custom' && (
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <div className="grid gap-1">
            <Label htmlFor="start-date" className="sr-only">Start Date</Label>
            <DatePicker
              id="start-date"
              selected={customStartDate}
              onSelect={setCustomStartDate}
              // onChange={handleDateChange} // Trigger update on change
            />
          </div>
          <span>-</span>
          <div className="grid gap-1">
            <Label htmlFor="end-date" className="sr-only">End Date</Label>
            <DatePicker
              id="end-date"
              selected={customEndDate}
              onSelect={setCustomEndDate}
              // onChange={handleDateChange} // Trigger update on change
            />
          </div>
        </div>
      )} */}
    </div>
  );
} 