import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isPast, isToday } from 'date-fns';
import scheduleService, { type Schedule, type CreateScheduleRequest, type TimeSlot } from '../../../services/scheduleService';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import toast from 'react-hot-toast';
import { cn } from '../../../utils/cn';

interface CustomerSchedulingProps {
  serviceRequestId: string;
  onScheduleCreated?: (schedule: Schedule) => void;
}

export const CustomerScheduling: React.FC<CustomerSchedulingProps> = ({
  serviceRequestId,
  onScheduleCreated,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(60);

  const { echo, isConnected } = useWebSocket();

  // Generate week dates for calendar
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(selectedDate), i)
  );

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Listen to WebSocket for real-time updates
  useEffect(() => {
    if (!echo || !isConnected) return;

    const schedulesChannel = echo.channel('schedules');

    schedulesChannel
      .listen('.schedule.created', () => {
        fetchSchedules();
        toast.success('Schedule updated in real-time');
      })
      .listen('.schedule.updated', () => {
        fetchSchedules();
        toast.success('Schedule updated in real-time');
      });

    return () => {
      echo.leave('schedules');
    };
  }, [echo, isConnected]);

  const fetchAvailableSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await scheduleService.getAvailableSlots(dateStr);
      setAvailableSlots(response.slots);
    } catch (error) {
      toast.error('Failed to load available time slots');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      const response = await scheduleService.getSchedules({
        upcoming: true,
      });
      setSchedules(response.data);
    } catch (error) {
      toast.error('Failed to load schedules');
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduleData: CreateScheduleRequest = {
        service_request_id: serviceRequestId,
        scheduled_at: selectedTime,
        notes: notes || undefined,
        location: location || undefined,
        estimated_duration_minutes: duration,
      };

      const response = await scheduleService.createSchedule(scheduleData);
      toast.success('Schedule created successfully!');

      // Reset form
      setSelectedTime('');
      setNotes('');
      setLocation('');
      setDuration(60);

      // Refresh schedules
      fetchSchedules();
      fetchAvailableSlots();

      onScheduleCreated?.(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create schedule';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to cancel this schedule?')) return;

    try {
      await scheduleService.cancelSchedule(scheduleId);
      toast.success('Schedule cancelled successfully');
      fetchSchedules();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel schedule';
      toast.error(message);
    }
  };

  const getStatusColor = (status: Schedule['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Schedule Service
          </h1>
          <p className="text-gray-600">Select a date and time for your service appointment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar and Time Slots */}
          <div className="lg:col-span-2 space-y-6">
            {/* Week Calendar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 backdrop-blur-sm bg-white/80">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Select Date</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDate(addWeeks(selectedDate, -1))}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Previous week"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Next week"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const isDisabled = isPast(date) && !isToday(date);
                  const isTodayDate = isToday(date);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => !isDisabled && setSelectedDate(date)}
                      disabled={isDisabled}
                      className={cn(
                        'relative p-4 rounded-xl text-center transition-all duration-200',
                        'hover:scale-105 hover:shadow-md',
                        isSelected && 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105',
                        !isSelected && !isDisabled && 'bg-gray-50 hover:bg-gray-100',
                        isDisabled && 'opacity-40 cursor-not-allowed hover:scale-100',
                        isTodayDate && !isSelected && 'ring-2 ring-blue-400'
                      )}
                    >
                      <div className="text-xs font-medium mb-1">
                        {format(date, 'EEE')}
                      </div>
                      <div className={cn(
                        'text-2xl font-bold',
                        isSelected && 'text-white',
                        !isSelected && 'text-gray-900'
                      )}>
                        {format(date, 'd')}
                      </div>
                      {isTodayDate && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 backdrop-blur-sm bg-white/80">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Time Slots</h2>

              {isLoadingSlots ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;

                    return (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={cn(
                          'p-3 rounded-lg font-medium text-sm transition-all duration-200',
                          'hover:scale-105',
                          isSelected && 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md scale-105',
                          !isSelected && slot.available && 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
                          !slot.available && 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                        )}
                      >
                        {slot.display}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No time slots available for this date</p>
                </div>
              )}
            </div>

            {/* Schedule Form */}
            {selectedTime && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 backdrop-blur-sm bg-white/80 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment Details</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter service location"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration
                    </label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any special instructions or requirements..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'w-full py-4 rounded-lg font-semibold text-white transition-all duration-200',
                      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
                      'shadow-lg hover:shadow-xl hover:scale-[1.02]',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                    )}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scheduling...
                      </span>
                    ) : (
                      'Confirm Schedule'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column - Schedules List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 backdrop-blur-sm bg-white/80 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Schedules</h2>

              {isLoadingSchedules ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : schedules.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md bg-gradient-to-br from-gray-50 to-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={cn(
                          'px-3 py-1 rounded-full text-xs font-semibold border',
                          getStatusColor(schedule.status)
                        )}>
                          {schedule.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(schedule.scheduled_at), 'MMM d')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-900">{schedule.scheduled_at_formatted}</span>
                        </div>

                        {schedule.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{schedule.location}</span>
                          </div>
                        )}

                        {schedule.engineer && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="truncate">{schedule.engineer.name}</span>
                          </div>
                        )}
                      </div>

                      {schedule.is_cancellable && (
                        <button
                          onClick={() => handleCancelSchedule(schedule.id)}
                          className="mt-3 w-full py-2 px-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Cancel Schedule
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No schedules yet</p>
                  <p className="text-sm mt-2">Create your first schedule above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in-from-bottom-4 {
          from { transform: translateY(1rem); }
          to { transform: translateY(0); }
        }

        .animate-in {
          animation: fade-in 0.5s ease-out, slide-in-from-bottom-4 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};
