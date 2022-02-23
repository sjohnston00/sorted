import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";

export default function CalendarComponent() {
  const today = new Date();
  const [value, onChange] = useState(today);

  useEffect(() => {
    console.log(value);
  }, [value]);

  return (
    <div>
      <Calendar
        onChange={onChange}
        value={value}
        minDate={today}
        className='text-white'
        tileContent={(props) => <p>&nbsp;</p>}
        showNeighboringMonth={true}
        showFixedNumberOfWeeks={true}
      />
    </div>
  );
}
