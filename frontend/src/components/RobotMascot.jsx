import { useEffect, useState } from 'react';

export default function RobotMascot({ state = 'idle', lang }) {
  const [blink, setBlink] = useState(false);
  const isUrdu = lang === 'ur';

  // Random natural blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 2500;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
        timeoutRef = scheduleBlink();
      }, delay);
    };
    let timeoutRef = scheduleBlink();
    return () => clearTimeout(timeoutRef);
  }, []);

  const isThinking = state === 'thinking';

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <style>{`
        @keyframes rm-float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes rm-antenna-pulse {
          0%, 100% { opacity: 0.4; r: 3; }
          50% { opacity: 1; r: 4.5; }
        }
        @keyframes rm-think-tilt {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes rm-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        .rm-body {
          animation: ${isThinking ? 'rm-think-tilt 0.9s ease-in-out infinite' : 'rm-float 3.5s ease-in-out infinite'};
          transform-origin: center bottom;
        }
        .rm-antenna-light {
          animation: rm-antenna-pulse 1.4s ease-in-out infinite;
        }
        .rm-dot {
          animation: rm-dot-bounce 1s infinite;
        }
      `}</style>

      <div className="rm-body relative w-32 h-32 sm:w-40 sm:h-40">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
          {/* Antenna */}
          <line x1="100" y1="35" x2="100" y2="15" stroke="#00401A" strokeWidth="4" strokeLinecap="round" className="dark:stroke-emerald-500" />
          <circle cx="100" cy="12" r="4" fill="#34d399" className="rm-antenna-light" />

          {/* Head */}
          <rect x="45" y="35" width="110" height="90" rx="28" fill="#00401A" className="dark:fill-emerald-700" />
          <rect x="45" y="35" width="110" height="90" rx="28" fill="url(#rm-gradient)" opacity="0.25" />

          {/* Face plate */}
          <rect x="58" y="50" width="84" height="60" rx="18" fill="#ecfdf5" className="dark:fill-slate-900" />

          {/* Eyes */}
          {blink ? (
            <>
              <line x1="76" y1="80" x2="90" y2="80" stroke="#00401A" strokeWidth="4" strokeLinecap="round" className="dark:stroke-emerald-400" />
              <line x1="110" y1="80" x2="124" y2="80" stroke="#00401A" strokeWidth="4" strokeLinecap="round" className="dark:stroke-emerald-400" />
            </>
          ) : (
            <>
              <circle cx="83" cy="80" r="7" fill="#00401A" className="dark:fill-emerald-400" />
              <circle cx="117" cy="80" r="7" fill="#00401A" className="dark:fill-emerald-400" />
            </>
          )}

          {/* Mouth */}
          {isThinking ? (
            <g>
              <circle cx="90" cy="98" r="3" fill="#00401A" className="dark:fill-emerald-400 rm-dot" style={{ animationDelay: '0s' }} />
              <circle cx="100" cy="98" r="3" fill="#00401A" className="dark:fill-emerald-400 rm-dot" style={{ animationDelay: '0.15s' }} />
              <circle cx="110" cy="98" r="3" fill="#00401A" className="dark:fill-emerald-400 rm-dot" style={{ animationDelay: '0.3s' }} />
            </g>
          ) : (
            <path d="M 85 96 Q 100 106 115 96" stroke="#00401A" strokeWidth="3.5" strokeLinecap="round" fill="none" className="dark:stroke-emerald-400" />
          )}

          {/* Ears / side nodes */}
          <circle cx="42" cy="75" r="8" fill="#046a38" className="dark:fill-emerald-600" />
          <circle cx="158" cy="75" r="8" fill="#046a38" className="dark:fill-emerald-600" />

          {/* Body */}
          <rect x="65" y="130" width="70" height="50" rx="16" fill="#046a38" className="dark:fill-emerald-800" />
          <circle cx="100" cy="152" r="10" fill="#34d399" opacity="0.85" />

          <defs>
            <linearGradient id="rm-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="text-center px-3">
        <p className={`text-xs font-bold text-[#00401A] dark:text-emerald-400 ${isUrdu ? 'urdu-text' : ''}`}>
          {isThinking
            ? (isUrdu ? 'سوچ رہا ہوں...' : 'Thinking...')
            : (isUrdu ? 'میں آپ کی مدد کے لیے حاضر ہوں' : "I'm here to help!")}
        </p>
      </div>
    </div>
  );
}