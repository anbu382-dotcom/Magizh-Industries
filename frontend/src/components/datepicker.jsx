import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/componentStyles/datepicker.css';

const DatePicker = ({ value, onChange, required = false, disabled = false }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(Math.floor(new Date().getFullYear() / 9) * 9);
  const [openUpward, setOpenUpward] = useState(false);
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      setSelectedDate(new Date(year, month - 1, day));
      setCurrentMonth(parseInt(month) - 1);
      setCurrentYear(parseInt(year));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smart positioning: Check if calendar should open upward or downward
  useEffect(() => {
    if (showCalendar && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const calendarHeight = 350; // Approximate calendar height
      
      // If not enough space below and more space above, open upward
      setOpenUpward(spaceBelow < calendarHeight && spaceAbove > spaceBelow);
    }
  }, [showCalendar]);

  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateSelect = (date) => {
    if (!date) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return;

    setSelectedDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    setShowCalendar(false);
  };

  const handleMonthChange = (e) => {
    setCurrentMonth(parseInt(e.target.value));
  };

  const handleYearSelect = (year) => {
    setCurrentYear(year);
    setShowYearPicker(false);
  };

  const previousYearRange = () => {
    setYearRangeStart(yearRangeStart - 9);
  };

  const nextYearRange = () => {
    const currentYearNow = new Date().getFullYear();
    if (yearRangeStart + 9 < currentYearNow) {
      setYearRangeStart(yearRangeStart + 9);
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const isFutureDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const currentYearNow = new Date().getFullYear();
  const yearRange = Array.from({ length: 9 }, (_, i) => yearRangeStart + i).filter(y => y <= currentYearNow);

  const days = getDaysInMonth(currentMonth, currentYear);

  return (
    <div className="custom-datepicker" ref={calendarRef}>
      <div 
        ref={inputRef}
        className={`datepicker-input ${disabled ? 'disabled' : ''}`} 
        onClick={() => !disabled && setShowCalendar(!showCalendar)}
      >
        <input
          type="text"
          value={formatDate(selectedDate)}
          placeholder="DD/MM/YYYY"
          readOnly
          required={required}
          disabled={disabled}
        />
        <Calendar size={18} className="calendar-icon" />
      </div>

      {showCalendar && !disabled && (
        <div className={`calendar-popup ${openUpward ? 'open-upward' : ''}`}>
          <div className="calendar-header">
            <div className="month-year-select">
              <div className="select-wrapper">
                <select value={currentMonth} onChange={handleMonthChange} className="month-select">
                  {monthNames.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="select-arrow" />
              </div>
              
              <div className="year-display" onClick={() => setShowYearPicker(!showYearPicker)}>
                {currentYear}
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {showYearPicker ? (
            <div className="year-picker">
              <div className="year-picker-header">
                <button type="button" onClick={previousYearRange} className="year-nav-btn">
                  <ChevronLeft size={16} />
                </button>
                <span className="year-range-label">{yearRangeStart} - {yearRangeStart + 8}</span>
                <button type="button" onClick={nextYearRange} className="year-nav-btn">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="year-grid">
                {yearRange.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`year-cell ${year === currentYear ? 'selected' : ''}`}
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="calendar-grid">
              {dayNames.map((day, idx) => (
                <div key={idx} className="day-name">{day}</div>
              ))}
              {days.map((date, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`day-cell ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''} ${isFutureDate(date) ? 'disabled' : ''}`}
                  onClick={() => handleDateSelect(date)}
                  disabled={!date || isFutureDate(date)}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
