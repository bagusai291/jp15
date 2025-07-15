import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RealTimeClockProps {
  showIcon?: boolean;
  showDate?: boolean;
  showSeconds?: boolean;
  className?: string;
}

const RealtimeClock = ({ 
  showIcon = true, 
  showDate = true, 
  showSeconds = true,
  className = ""
}: RealTimeClockProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Format date as "DD Month YYYY"
  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Format time as "HH:MM:SS"
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: false
  });

  // Get timezone abbreviation (JST for Japan)
  const timezone = 'JST';

  return (
    <div className={`flex items-center text-gray-700 print:hidden ${className}`}>
      {showIcon && <Clock className="w-4 h-4 mr-2" />}
      <div className="flex flex-col sm:flex-row sm:items-center text-right">
        {showDate && (
          <span className="text-sm font-medium sm:mr-2">{formattedDate}</span>
        )}
        <div className="flex items-center">
          <span className="font-bold text-primary">{formattedTime}</span>
          <span className="ml-1 text-xs font-medium text-gray-500">{timezone}</span>
        </div>
      </div>
    </div>
  );
};

export default RealtimeClock;