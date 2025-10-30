import { useState, useEffect, useRef } from 'react';
import { sanitizeInput } from '../../utils/sanitizeInput';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  showCursor?: boolean;
  cursorHideDelay?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({ 
  text, 
  speed = 120, 
  delay = 0,
  showCursor = true,
  cursorHideDelay = 1000,
  className = '',
  onComplete
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [showCursorState, setShowCursorState] = useState(showCursor);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startAnimation = () => {
      let index = 0;
      const timer = setInterval(() => {
        setDisplayText(sanitizeInput.escapeHtml(text.slice(0, index)));
        index++;
        if (index > text.length) {
          clearInterval(timer);
          if (showCursor && cursorHideDelay > 0) {
            setTimeout(() => setShowCursorState(false), cursorHideDelay);
          }
          onComplete?.();
        }
      }, speed);
    };

    if (delay > 0) {
      setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
  }, []); // Empty dependency array

  return (
    <span className={className}>
      {displayText}
      {showCursorState && <span className="animate-pulse">|</span>}
    </span>
  );
}