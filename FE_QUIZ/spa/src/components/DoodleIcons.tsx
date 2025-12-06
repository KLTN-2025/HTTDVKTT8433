import React from 'react'

interface DoodleIconProps {
  name: string
  size?: number
  className?: string
}

const DoodleIcons: React.FC<DoodleIconProps> = ({ name, size = 24, className = '' }) => {
  const iconStyle = {
    width: size,
    height: size,
    fill: 'none',
    stroke: '#374151',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }

  const icons: { [key: string]: React.ReactNode } = {
    // 🏠 Home - Cute house with chimney
    'home': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#FBB6CE" stroke="#374151" strokeWidth="2"/>
        <path d="M9 22V12h6v10" fill="#FDE68A" stroke="#374151" strokeWidth="1.5"/>
        <rect x="10" y="6" width="4" height="3" fill="#A7F3D0" stroke="#374151" strokeWidth="1"/>
        <circle cx="12" cy="7.5" r="0.5" fill="#FDE68A"/>
      </svg>
    ),

    // 🎨 Paint Palette - Colorful palette
    'palette': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" fill="#FBB6CE" stroke="#374151" strokeWidth="2"/>
        <circle cx="8" cy="8" r="1.5" fill="#FDE68A"/>
        <circle cx="12" cy="6" r="1.5" fill="#A7F3D0"/>
        <circle cx="16" cy="8" r="1.5" fill="#DDD6FE"/>
        <circle cx="14" cy="12" r="1.5" fill="#FECACA"/>
        <path d="M6 16l4-4" stroke="#FDE68A" strokeWidth="2"/>
      </svg>
    ),

    // 🌍 Globe - Earth with continents
    'globe': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10" fill="#A7F3D0" stroke="#374151" strokeWidth="2"/>
        <path d="M2 12h20" stroke="#FDE68A" strokeWidth="1.5"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="#DDD6FE" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1" fill="#FBB6CE"/>
        <circle cx="16" cy="16" r="1" fill="#FDE68A"/>
        <circle cx="16" cy="8" r="0.5" fill="#A7F3D0"/>
        <circle cx="8" cy="16" r="0.5" fill="#DDD6FE"/>
      </svg>
    ),

    // 🏛️ Temple - Greek temple
    'temple': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M3 21h18" stroke="#374151" strokeWidth="2"/>
        <path d="M5 21V7l7-4 7 4v14" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
        <path d="M9 21V9h6v12" fill="#DDD6FE" stroke="#374151" strokeWidth="1.5"/>
        <rect x="10" y="5" width="4" height="4" fill="#A7F3D0" stroke="#374151" strokeWidth="1"/>
        <circle cx="12" cy="7" r="0.5" fill="#FBB6CE"/>
        <path d="M8 13h8" stroke="#FDE68A" strokeWidth="1.5"/>
        <path d="M8 17h8" stroke="#FDE68A" strokeWidth="1.5"/>
      </svg>
    ),

    // 💬 Chat Bubble - Speech bubble
    'chat': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#FBB6CE" stroke="#374151" strokeWidth="2"/>
        <circle cx="9" cy="9" r="1" fill="#FDE68A"/>
        <circle cx="15" cy="9" r="1" fill="#FDE68A"/>
        <path d="M8 13h8" stroke="#FDE68A" strokeWidth="1.5"/>
        <path d="M19 5l-2 2" stroke="#A7F3D0" strokeWidth="1.5"/>
      </svg>
    ),

    // 🍃 Leaf - Nature leaf
    'leaf': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" fill="#A7F3D0" stroke="#374151" strokeWidth="2"/>
        <path d="M5 21c2.5-3.5 4-7 4-10" fill="#FDE68A" stroke="#374151" strokeWidth="1.5"/>
        <path d="M7 8l2 2" stroke="#FBB6CE" strokeWidth="1.5"/>
        <path d="M9 12l2 2" stroke="#DDD6FE" strokeWidth="1.5"/>
        <circle cx="8" cy="6" r="0.5" fill="#FDE68A"/>
        <circle cx="12" cy="4" r="0.5" fill="#A7F3D0"/>
      </svg>
    ),

    // 🏀 Basketball - Sports ball
    'basketball': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="#FBB6CE" stroke="#374151" strokeWidth="1.5"/>
        <path d="M2 12h20" stroke="#A7F3D0" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1" fill="#DDD6FE"/>
        <circle cx="16" cy="16" r="1" fill="#A7F3D0"/>
        <circle cx="16" cy="8" r="0.5" fill="#FDE68A"/>
        <circle cx="8" cy="16" r="0.5" fill="#FBB6CE"/>
      </svg>
    ),

    // ❓ Question Mark - Quiz symbol
    'question': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10" fill="#DDD6FE" stroke="#374151" strokeWidth="2"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#FBB6CE" strokeWidth="2"/>
        <circle cx="12" cy="17" r="1" fill="#FDE68A"/>
        <circle cx="8" cy="8" r="0.5" fill="#A7F3D0"/>
        <circle cx="16" cy="8" r="0.5" fill="#FDE68A"/>
        <circle cx="8" cy="16" r="0.5" fill="#FBB6CE"/>
        <circle cx="16" cy="16" r="0.5" fill="#A7F3D0"/>
      </svg>
    ),

    // 📚 Book - Education
    'book': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="#FBB6CE" stroke="#374151" strokeWidth="2"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
        <path d="M8 6h8" stroke="#A7F3D0" strokeWidth="1.5"/>
        <path d="M8 10h6" stroke="#DDD6FE" strokeWidth="1.5"/>
        <path d="M8 14h8" stroke="#FBB6CE" strokeWidth="1.5"/>
        <circle cx="10" cy="4" r="0.5" fill="#A7F3D0"/>
        <circle cx="14" cy="4" r="0.5" fill="#FDE68A"/>
      </svg>
    ),

    // 🧮 Calculator - Math
    'calculator': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <rect x="4" y="2" width="16" height="20" rx="2" fill="#A7F3D0" stroke="#374151" strokeWidth="2"/>
        <rect x="6" y="4" width="12" height="6" fill="#FDE68A" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="8" cy="7" r="0.5" fill="#FBB6CE"/>
        <circle cx="12" cy="7" r="0.5" fill="#DDD6FE"/>
        <circle cx="16" cy="7" r="0.5" fill="#A7F3D0"/>
        <rect x="6" y="12" width="3" height="2" fill="#FBB6CE" stroke="#374151" strokeWidth="1"/>
        <rect x="10" y="12" width="3" height="2" fill="#DDD6FE" stroke="#374151" strokeWidth="1"/>
        <rect x="14" y="12" width="3" height="2" fill="#FDE68A" stroke="#374151" strokeWidth="1"/>
        <rect x="6" y="15" width="3" height="2" fill="#A7F3D0" stroke="#374151" strokeWidth="1"/>
        <rect x="10" y="15" width="3" height="2" fill="#FBB6CE" stroke="#374151" strokeWidth="1"/>
        <rect x="14" y="15" width="3" height="2" fill="#DDD6FE" stroke="#374151" strokeWidth="1"/>
      </svg>
    ),

    // 🔬 Science - Lab equipment
    'science': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M9 2v6l-2 2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8l-2-2V2" fill="#DDD6FE" stroke="#374151" strokeWidth="2"/>
        <path d="M9 2h6" stroke="#FBB6CE" strokeWidth="2"/>
        <circle cx="12" cy="8" r="1" fill="#FDE68A"/>
        <path d="M10 12h4" stroke="#A7F3D0" strokeWidth="1.5"/>
        <path d="M11 14h2" stroke="#FBB6CE" strokeWidth="1.5"/>
        <circle cx="8" cy="6" r="0.5" fill="#A7F3D0"/>
        <circle cx="16" cy="6" r="0.5" fill="#FDE68A"/>
        <circle cx="12" cy="4" r="0.5" fill="#FBB6CE"/>
      </svg>
    ),

    // 🎵 Music - Musical note
    'music': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M9 18V5l12-2v13" fill="#FBB6CE" stroke="#374151" strokeWidth="2"/>
        <circle cx="6" cy="18" r="3" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
        <circle cx="18" cy="16" r="3" fill="#A7F3D0" stroke="#374151" strokeWidth="2"/>
        <path d="M9 9l12-2" stroke="#DDD6FE" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="0.5" fill="#A7F3D0"/>
        <circle cx="16" cy="6" r="0.5" fill="#FDE68A"/>
        <circle cx="20" cy="4" r="0.5" fill="#FBB6CE"/>
      </svg>
    ),

    // 🎨 Art - Paint brush
    'art': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M12 19l7-7 3 3-7 7-3-3z" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
        <path d="M18 13l-1.5-1.5L2 22l3.5 3.5L18 13z" fill="#A7F3D0" stroke="#374151" strokeWidth="2"/>
        <path d="M2 2l7.586 7.586" stroke="#FBB6CE" strokeWidth="2"/>
        <circle cx="11" cy="11" r="1" fill="#DDD6FE"/>
        <circle cx="15" cy="7" r="0.5" fill="#FDE68A"/>
        <circle cx="19" cy="3" r="0.5" fill="#A7F3D0"/>
        <circle cx="3" cy="19" r="0.5" fill="#FBB6CE"/>
      </svg>
    ),

    // 🏃 Sports - Running figure
    'sports': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="4" r="2" fill="#FBB6CE" stroke="#374151" strokeWidth="2"/>
        <path d="M12 6v8" stroke="#A7F3D0" strokeWidth="2"/>
        <path d="M8 14l4-2 4 2" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
        <path d="M6 18l2-2" stroke="#DDD6FE" strokeWidth="2"/>
        <path d="M18 18l-2-2" stroke="#FBB6CE" strokeWidth="2"/>
        <circle cx="5" cy="20" r="1" fill="#A7F3D0"/>
        <circle cx="19" cy="20" r="1" fill="#FDE68A"/>
        <circle cx="12" cy="2" r="0.5" fill="#FDE68A"/>
        <circle cx="8" cy="6" r="0.5" fill="#A7F3D0"/>
        <circle cx="16" cy="6" r="0.5" fill="#DDD6FE"/>
      </svg>
    ),

    // 🌟 Star - Achievement
    'star': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" fill="#FBB6CE"/>
        <circle cx="8" cy="8" r="0.5" fill="#A7F3D0"/>
        <circle cx="16" cy="8" r="0.5" fill="#DDD6FE"/>
        <circle cx="8" cy="16" r="0.5" fill="#FDE68A"/>
        <circle cx="16" cy="16" r="0.5" fill="#FBB6CE"/>
      </svg>
    ),

    // 🎯 Target - Goals
    'target': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10" fill="#A7F3D0" stroke="#374151" strokeWidth="2"/>
        <circle cx="12" cy="12" r="6" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" fill="#FBB6CE" stroke="#374151" strokeWidth="2"/>
        <circle cx="12" cy="12" r="0.5" fill="#DDD6FE"/>
        <circle cx="8" cy="8" r="0.5" fill="#FDE68A"/>
        <circle cx="16" cy="8" r="0.5" fill="#A7F3D0"/>
        <circle cx="8" cy="16" r="0.5" fill="#FBB6CE"/>
        <circle cx="16" cy="16" r="0.5" fill="#DDD6FE"/>
      </svg>
    ),

    // 🧩 Puzzle - Problem solving
    'puzzle': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M4 7h3a1 1 0 0 0 1-1V5a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3v4a1 1 0 0 1-1 1h-3a1 1 0 0 0-1 1v1a2 2 0 0 1-4 0v-1a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1a2 2 0 0 1-4 0v-1a1 1 0 0 0-1-1H1V7h3z" fill="#DDD6FE" stroke="#374151" strokeWidth="2"/>
        <circle cx="6" cy="6" r="1" fill="#FDE68A"/>
        <circle cx="18" cy="6" r="1" fill="#A7F3D0"/>
        <circle cx="6" cy="18" r="1" fill="#FBB6CE"/>
        <circle cx="18" cy="18" r="1" fill="#FDE68A"/>
        <circle cx="12" cy="12" r="1" fill="#A7F3D0"/>
      </svg>
    ),

    // 🎪 Circus - Fun activities
    'circus': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FBB6CE" stroke="#374151" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" fill="#FDE68A"/>
        <circle cx="12" cy="12" r="1" fill="#A7F3D0"/>
        <circle cx="8" cy="8" r="0.5" fill="#DDD6FE"/>
        <circle cx="16" cy="8" r="0.5" fill="#FDE68A"/>
        <circle cx="8" cy="16" r="0.5" fill="#A7F3D0"/>
        <circle cx="16" cy="16" r="0.5" fill="#FBB6CE"/>
      </svg>
    )
  }

  return <>{icons[name] || <div>Icon not found</div>}</>
}

export default DoodleIcons