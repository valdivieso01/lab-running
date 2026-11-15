import React from 'react';

interface ExerciseDiagramProps {
  exerciseId: string;
  className?: string;
  detailed?: boolean; // if true, renders full technical diagram with angle markers
}

export function ExerciseDiagram({ exerciseId, className = 'w-full h-full', detailed = false }: ExerciseDiagramProps) {
  // Normalize exercise ID for shared diagrams
  const normalizedId = exerciseId.startsWith('fb-') ? exerciseId.replace('fb-', '') : exerciseId;

  const renderVisual = () => {
    switch (normalizedId) {
      // 1. Bench Press (Flat)
      case 'bench-press':
      case 'bench':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Flat Bench */}
            <rect x="70" y="125" width="180" height="12" rx="3" fill="#1e3442" stroke="#2c4d61" strokeWidth="2" />
            <rect x="90" y="137" width="10" height="33" fill="#1e3442" />
            <rect x="220" y="137" width="10" height="33" fill="#1e3442" />

            {/* Athlete lying on bench */}
            {/* Torso */}
            <rect x="100" y="112" width="95" height="15" rx="5" fill="#486577" />
            {/* Chest muscle highlight */}
            <path d="M125 112 H155 V123 H125 Z" fill="#10b981" opacity="0.9" />
            {/* Head */}
            <circle cx="88" cy="119" r="9" fill="#486577" />
            {/* Legs & Feet on floor */}
            <path d="M195 119 L225 130 L225 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Arms pressing barbell */}
            <path d="M140 115 L140 78" stroke="#486577" strokeWidth="9" strokeLinecap="round" />
            
            {/* Barbell & Plates */}
            <rect x="138" y="70" width="4" height="16" fill="#10b981" />
            <line x1="50" y1="78" x2="230" y2="78" stroke="#cbd5e1" strokeWidth="4" />
            <rect x="55" y="60" width="8" height="36" rx="2" fill="#10b981" stroke="#fff" strokeWidth="1" />
            <rect x="217" y="60" width="8" height="36" rx="2" fill="#10b981" stroke="#fff" strokeWidth="1" />
            
            {/* Movement arrows */}
            <path d="M140 65 L140 50 M137 53 L140 50 L143 53" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            
            {/* Angle Badge */}
            <g transform="translate(195, 25)">
              <rect width="105" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="52" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Codos a 45° • Pectoral</text>
            </g>
          </svg>
        );

      // 2. Incline DB Press
      case 'incline-db-press':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Incline Bench (35 deg) */}
            <path d="M80 155 L165 95" stroke="#1e3442" strokeWidth="14" strokeLinecap="round" />
            <rect x="75" y="150" width="35" height="12" rx="3" fill="#1e3442" />
            <line x1="140" y1="115" x2="140" y2="170" stroke="#1e3442" strokeWidth="6" />

            {/* Torso angled */}
            <path d="M95 145 L155 102" stroke="#486577" strokeWidth="16" strokeLinecap="round" />
            {/* Upper chest highlight */}
            <circle cx="140" cy="112" r="7" fill="#10b981" />
            {/* Head */}
            <circle cx="170" cy="92" r="9" fill="#486577" />
            {/* Legs */}
            <path d="M95 145 L115 150 L115 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />
            
            {/* Arms pressing up */}
            <path d="M135 110 L155 65" stroke="#486577" strokeWidth="8" strokeLinecap="round" />
            {/* Dumbbells */}
            <rect x="145" y="52" width="22" height="10" rx="3" fill="#cbd5e1" transform="rotate(-15 145 52)" />
            <circle cx="145" cy="56" r="6" fill="#10b981" />
            <circle cx="165" cy="51" r="6" fill="#10b981" />

            <g transform="translate(190, 25)">
              <rect width="115" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="57" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Banco a 30°-45° • Clavicular</text>
            </g>
          </svg>
        );

      // 3. Cable Flyes
      case 'cable-flyes':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />
            {/* Pulley towers */}
            <line x1="45" y1="30" x2="45" y2="170" stroke="#1e3442" strokeWidth="8" />
            <line x1="275" y1="30" x2="275" y2="170" stroke="#1e3442" strokeWidth="8" />
            {/* Cables */}
            <path d="M45 50 Q110 85 145 105" stroke="#607d8b" strokeWidth="2" strokeDasharray="2 2" />
            <path d="M275 50 Q210 85 175 105" stroke="#607d8b" strokeWidth="2" strokeDasharray="2 2" />

            {/* Standing figure forward stance */}
            <circle cx="160" cy="70" r="10" fill="#486577" />
            <path d="M160 80 L160 120" stroke="#486577" strokeWidth="18" strokeLinecap="round" />
            <circle cx="160" cy="95" r="7" fill="#10b981" />
            {/* Staggered legs */}
            <path d="M155 120 L140 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />
            <path d="M165 120 L185 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />
            {/* Hugging arms arc */}
            <path d="M150 90 Q120 100 145 105" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            <path d="M170 90 Q200 100 175 105" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />

            <g transform="translate(190, 25)">
              <rect width="115" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="57" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Abrazo en Polea • Aislamiento</text>
            </g>
          </svg>
        );

      // 4. Biceps Curl (EZ Bar / DB)
      case 'ez-bar-curl':
      case 'chins':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />

            {/* Standing figure profile */}
            <circle cx="145" cy="55" r="10" fill="#486577" />
            <path d="M145 65 L145 115" stroke="#486577" strokeWidth="16" strokeLinecap="round" />
            <path d="M145 115 L140 170 M150 115 L155 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />

            {/* Upper arm vertical (pinned to ribcage) */}
            <path d="M148 75 L152 102" stroke="#486577" strokeWidth="9" strokeLinecap="round" />
            {/* Forearm curled up */}
            <path d="M152 102 L172 80" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            {/* Biceps bulge highlighted */}
            <circle cx="156" cy="88" r="7" fill="#10b981" />

            {/* Barbell / Dumbbell */}
            <circle cx="175" cy="78" r="8" fill="#cbd5e1" stroke="#10b981" strokeWidth="2" />
            <path d="M165 105 Q175 95 175 85" stroke="#ffc83b" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />

            <g transform="translate(180, 25)">
              <rect width="125" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="62" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Codos fijos a 90° • Bíceps</text>
            </g>
          </svg>
        );

      // 5. Hammer Curl
      case 'hammer-curl':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />

            {/* Athlete */}
            <circle cx="145" cy="55" r="10" fill="#486577" />
            <path d="M145 65 L145 115" stroke="#486577" strokeWidth="16" strokeLinecap="round" />
            <path d="M145 115 L145 170" stroke="#486577" strokeWidth="11" strokeLinecap="round" />

            {/* Neutral grip dumbbell (vertical) */}
            <path d="M148 75 L152 102" stroke="#486577" strokeWidth="9" strokeLinecap="round" />
            <path d="M152 102 L172 82" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            {/* Forearm brachioradialis highlight */}
            <path d="M155 98 L168 85" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
            {/* Vertical dumbbell */}
            <rect x="170" y="70" width="8" height="24" rx="2" fill="#cbd5e1" stroke="#10b981" strokeWidth="1" />

            <g transform="translate(180, 25)">
              <rect width="125" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="62" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Agarre Neutro • Braquiorradial</text>
            </g>
          </svg>
        );

      // 6. Lateral Raises / Pallof
      case 'lateral-raises':
      case 'pallof':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />

            <circle cx="160" cy="55" r="10" fill="#486577" />
            <path d="M160 65 L160 120" stroke="#486577" strokeWidth="16" strokeLinecap="round" />
            <path d="M153 120 L150 170 M167 120 L170 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />

            {/* Deltoids highlighted */}
            <circle cx="148" cy="74" r="6" fill="#10b981" />
            <circle cx="172" cy="74" r="6" fill="#10b981" />
            {/* Arms raised horizontally like wings */}
            <path d="M148 75 L105 78" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            <path d="M172 75 L215 78" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            {/* Dumbbells in hands */}
            <rect x="95" y="72" width="10" height="14" rx="2" fill="#cbd5e1" />
            <rect x="215" y="72" width="10" height="14" rx="2" fill="#cbd5e1" />

            {/* Arc arrows */}
            <path d="M125 110 Q105 100 105 88" stroke="#ffc83b" strokeWidth="2" strokeDasharray="2 2" />
            <path d="M195 110 Q215 100 215 88" stroke="#ffc83b" strokeWidth="2" strokeDasharray="2 2" />

            <g transform="translate(180, 25)">
              <rect width="125" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="62" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Elevación Lateral • Hombro</text>
            </g>
          </svg>
        );

      // 7. Pull-ups (Dominadas)
      case 'pull-ups':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            
            {/* Pull-up Bar */}
            <line x1="80" y1="35" x2="240" y2="35" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
            <line x1="90" y1="20" x2="90" y2="35" stroke="#2c4d61" strokeWidth="4" />
            <line x1="230" y1="20" x2="230" y2="35" stroke="#2c4d61" strokeWidth="4" />

            {/* Athlete Hanging / Pulling */}
            {/* Hands on bar */}
            <circle cx="120" cy="35" r="5" fill="#486577" />
            <circle cx="200" cy="35" r="5" fill="#486577" />
            {/* Arms driving down */}
            <path d="M120 35 L135 60 L148 75" stroke="#486577" strokeWidth="8" strokeLinecap="round" />
            <path d="M200 35 L185 60 L172 75" stroke="#486577" strokeWidth="8" strokeLinecap="round" />

            {/* Head clearing or reaching bar */}
            <circle cx="160" cy="55" r="9" fill="#486577" />
            {/* Dorsal V-Shape highlighted in Green */}
            <path d="M148 70 L172 70 L166 115 L154 115 Z" fill="#10b981" opacity="0.95" />
            {/* Spine & lower torso */}
            <path d="M160 115 L160 135" stroke="#486577" strokeWidth="12" strokeLinecap="round" />
            {/* Legs bent at knees */}
            <path d="M160 135 L155 160 L165 175" stroke="#486577" strokeWidth="8" strokeLinecap="round" />

            <g transform="translate(180, 20)">
              <rect width="125" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="62" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Tracción Dorsal • Espalda en V</text>
            </g>
          </svg>
        );

      // 8. Barbell Row (Remo con Barra)
      case 'barbell-row':
      case 'row':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />

            {/* Torso angled 45 degrees */}
            <circle cx="130" cy="75" r="9" fill="#486577" />
            <path d="M135 82 L185 118" stroke="#486577" strokeWidth="15" strokeLinecap="round" />
            {/* Rhomboids & Lats highlight on back */}
            <path d="M140 80 L180 110" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />

            {/* Hips & Legs (bent knees) */}
            <path d="M185 118 L190 145 L180 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />
            
            {/* Arms rowing bar toward naval */}
            <path d="M150 92 L160 110 L162 120" stroke="#486577" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Barbell & Plates */}
            <circle cx="162" cy="122" r="10" fill="#10b981" stroke="#cbd5e1" strokeWidth="2" />
            
            {/* Upward arrow */}
            <path d="M162 135 L162 110" stroke="#ffc83b" strokeWidth="2" strokeDasharray="2 2" />

            <g transform="translate(175, 25)">
              <rect width="130" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="65" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Torso a 45° • Romboides/Dorsal</text>
            </g>
          </svg>
        );

      // 9. Cable Row / Pullover
      case 'cable-row-pullover':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />
            {/* Seated cable bench */}
            <rect x="120" y="145" width="70" height="10" rx="2" fill="#1e3442" />
            <line x1="60" y1="90" x2="60" y2="170" stroke="#1e3442" strokeWidth="8" />
            {/* Cable */}
            <line x1="60" y1="130" x2="140" y2="130" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />

            {/* Seated athlete */}
            <circle cx="165" cy="95" r="9" fill="#486577" />
            <path d="M165 105 L160 145" stroke="#486577" strokeWidth="14" strokeLinecap="round" />
            <path d="M160 145 L125 145 L115 170" stroke="#486577" strokeWidth="9" strokeLinecap="round" />
            {/* Dorsal contracted */}
            <circle cx="166" cy="120" r="7" fill="#10b981" />
            {/* Arms pulling to belly */}
            <path d="M162 112 L172 130 L140 130" stroke="#10b981" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

            <g transform="translate(180, 25)">
              <rect width="125" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="62" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Remo Sentado • Espalda Media</text>
            </g>
          </svg>
        );

      // 10. Dips (Fondos en paralelas)
      case 'dips-french-press':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />
            {/* Parallel Dip Bars */}
            <rect x="110" y="85" width="100" height="8" rx="2" fill="#cbd5e1" />
            <line x1="120" y1="85" x2="120" y2="170" stroke="#1e3442" strokeWidth="6" />
            <line x1="200" y1="85" x2="200" y2="170" stroke="#1e3442" strokeWidth="6" />

            {/* Athlete suspended dipping to 90 deg */}
            <circle cx="150" cy="65" r="9" fill="#486577" />
            <path d="M150 75 L155 125" stroke="#486577" strokeWidth="15" strokeLinecap="round" />
            {/* Triceps highlighted on arms */}
            <path d="M148 80 L140 85 L145 92" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="138" cy="85" r="6" fill="#10b981" />
            {/* Legs bent back */}
            <path d="M155 125 L165 145 L155 155" stroke="#486577" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />

            <g transform="translate(180, 25)">
              <rect width="125" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="62" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Fondos a 90° • Tríceps / Pecho</text>
            </g>
          </svg>
        );

      // 11. Triceps Rope Pushdown
      case 'triceps-rope-pushdown':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />
            {/* High Pulley */}
            <line x1="160" y1="20" x2="160" y2="40" stroke="#cbd5e1" strokeWidth="4" />
            <circle cx="160" cy="40" r="5" fill="#10b981" />
            {/* Rope split */}
            <path d="M160 40 L155 105 M160 40 L165 105" stroke="#cbd5e1" strokeWidth="3" />

            {/* Athlete standing close */}
            <circle cx="135" cy="65" r="9" fill="#486577" />
            <path d="M135 75 L135 125" stroke="#486577" strokeWidth="15" strokeLinecap="round" />
            <path d="M135 125 L135 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />
            {/* Upper arm vertical */}
            <path d="M138 80 L140 105" stroke="#486577" strokeWidth="8" strokeLinecap="round" />
            {/* Triceps lateral head highlight */}
            <circle cx="137" cy="92" r="6" fill="#10b981" />
            {/* Forearm extended down flaring rope */}
            <path d="M140 105 L160 115" stroke="#10b981" strokeWidth="7" strokeLinecap="round" />

            <g transform="translate(180, 25)">
              <rect width="125" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="62" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Polea Alta • Cabeza Lateral</text>
            </g>
          </svg>
        );

      // 12. Face Pulls
      case 'face-pulls':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />
            {/* Pulley at face height */}
            <line x1="60" y1="30" x2="60" y2="170" stroke="#1e3442" strokeWidth="8" />
            <circle cx="60" cy="80" r="5" fill="#10b981" />
            <path d="M60 80 L135 75 M60 80 L135 85" stroke="#cbd5e1" strokeWidth="2" />

            {/* Athlete upright */}
            <circle cx="160" cy="70" r="9" fill="#486577" />
            <path d="M160 80 L160 125" stroke="#486577" strokeWidth="15" strokeLinecap="round" />
            <path d="M155 125 L150 170 M165 125 L170 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />
            {/* Rear delt & Rotator cuff highlight */}
            <circle cx="166" cy="84" r="6" fill="#10b981" />
            {/* High elbows pulling back to ears */}
            <path d="M135 75 L150 82 L172 75" stroke="#10b981" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

            <g transform="translate(180, 25)">
              <rect width="125" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="62" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Manos a las Sienes • Manguito</text>
            </g>
          </svg>
        );

      // 13. Back Squat (Sentadilla Trasera)
      case 'back-squat':
      case 'squat':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />

            {/* Deep Squat Position (Thigh parallel or below) */}
            {/* Head */}
            <circle cx="130" cy="85" r="9" fill="#486577" />
            {/* Barbell resting on upper traps */}
            <line x1="90" y1="88" x2="170" y2="88" stroke="#cbd5e1" strokeWidth="4" />
            <circle cx="95" cy="88" r="10" fill="#10b981" />
            <circle cx="165" cy="88" r="10" fill="#10b981" />

            {/* Torso straight angled forward */}
            <path d="M130 95 L155 125" stroke="#486577" strokeWidth="15" strokeLinecap="round" />
            {/* Thigh (Femur horizontal / parallel) highlighted in Emerald */}
            <path d="M155 125 L120 128" stroke="#10b981" strokeWidth="14" strokeLinecap="round" />
            {/* Glute highlight */}
            <circle cx="158" cy="126" r="8" fill="#10b981" />
            {/* Shin (Tibia) to floor */}
            <path d="M120 128 L115 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />
            {/* Foot firm */}
            <path d="M110 170 L125 170" stroke="#486577" strokeWidth="4" strokeLinecap="round" />

            {/* Depth line */}
            <line x1="100" y1="128" x2="180" y2="128" stroke="#ffc83b" strokeWidth="1.5" strokeDasharray="3 3" />

            <g transform="translate(180, 25)">
              <rect width="125" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="62" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Cadera a Paralelo • Cuádriceps/Glúteo</text>
            </g>
          </svg>
        );

      // 14. Romanian Deadlift (Peso Muerto Rumano - RDL)
      case 'rdl-deadlift':
      case 'deadlift':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />

            {/* Hip hinge (hips pushed back, spine neutral) */}
            <circle cx="120" cy="90" r="9" fill="#486577" />
            <path d="M125 96 L175 115" stroke="#486577" strokeWidth="14" strokeLinecap="round" />
            
            {/* Hamstrings & Glutes highlighted (tense chain) */}
            <circle cx="180" cy="116" r="9" fill="#10b981" />
            <path d="M175 115 L170 145" stroke="#10b981" strokeWidth="12" strokeLinecap="round" />
            {/* Slight knee bend */}
            <path d="M170 145 L165 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />

            {/* Arms hanging straight down with bar at mid-shin/knee */}
            <path d="M135 100 L140 140" stroke="#486577" strokeWidth="7" strokeLinecap="round" />
            <circle cx="140" cy="142" r="10" fill="#10b981" stroke="#cbd5e1" strokeWidth="2" />
            
            {/* Hip push-back arrow */}
            <path d="M165 110 L195 110 M190 106 L195 110 L190 114" stroke="#ffc83b" strokeWidth="2" strokeLinecap="round" />

            <g transform="translate(175, 25)">
              <rect width="130" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="65" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Bisagra de Cadera • Isquiotibiales</text>
            </g>
          </svg>
        );

      // 15. Bulgarian Split Squat
      case 'bulgarian-split-squat':
      case 'lunge':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />
            {/* Bench behind for rear foot */}
            <rect x="210" y="130" width="45" height="15" rx="3" fill="#1e3442" stroke="#2c4d61" strokeWidth="1.5" />
            <rect x="230" y="145" width="8" height="25" fill="#1e3442" />

            {/* Front Leg in deep lunge (90 deg front knee) */}
            <circle cx="145" cy="65" r="9" fill="#486577" />
            <path d="M145 75 L145 125" stroke="#486577" strokeWidth="15" strokeLinecap="round" />
            {/* Front Thigh & Glute highlight */}
            <path d="M145 125 L120 135" stroke="#10b981" strokeWidth="12" strokeLinecap="round" />
            <circle cx="147" cy="126" r="7" fill="#10b981" />
            <path d="M120 135 L120 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" />

            {/* Rear leg resting on bench */}
            <path d="M145 125 L175 155 L215 130" stroke="#486577" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Holding Dumbbells at sides */}
            <rect x="135" y="110" width="8" height="18" rx="2" fill="#cbd5e1" stroke="#10b981" strokeWidth="1" />

            <g transform="translate(175, 25)">
              <rect width="130" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="65" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Pie en Banco • Glúteo Medio</text>
            </g>
          </svg>
        );

      // 16. Seated Calf Raise (Elevación de Talón Sentado - SÓLEO)
      case 'seated-calf-raise':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />

            {/* Seated Calf Machine Bench & Pad */}
            <rect x="100" y="125" width="55" height="12" rx="3" fill="#1e3442" stroke="#2c4d61" strokeWidth="2" />
            <rect x="115" y="137" width="10" height="33" fill="#1e3442" />
            {/* Knee pad holding weights */}
            <rect x="175" y="112" width="25" height="12" rx="4" fill="#cbd5e1" stroke="#10b981" strokeWidth="1.5" />
            {/* Weight plate on machine */}
            <circle cx="188" cy="98" r="14" fill="#10b981" opacity="0.8" />
            {/* Foot block */}
            <rect x="180" y="162" width="25" height="8" rx="2" fill="#1e3442" />

            {/* Seated Athlete with Knee at strict 90° */}
            <circle cx="120" cy="85" r="9" fill="#486577" />
            <path d="M120 95 L125 130" stroke="#486577" strokeWidth="15" strokeLinecap="round" />
            {/* Thigh horizontal under pad */}
            <path d="M125 130 L180 124" stroke="#486577" strokeWidth="12" strokeLinecap="round" />
            {/* Tibia & Calves vertical */}
            <path d="M180 124 L185 162" stroke="#486577" strokeWidth="10" strokeLinecap="round" />
            
            {/* CRUCIAL SÓLEO MUSCLE HIGHLIGHT (Deep Calf) */}
            <path d="M187 130 L191 150 L187 158" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            <circle cx="190" cy="142" r="6" fill="#10b981" />

            {/* 90 degree indicator */}
            <path d="M175 124 L175 132 L183 132" stroke="#ffc83b" strokeWidth="2" />

            <g transform="translate(170, 25)">
              <rect width="135" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="67" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Rodilla a 90° • AISLA EL SÓLEO</text>
            </g>
          </svg>
        );

      // 17. Standing Calf Raise (De pie)
      case 'standing-calf-raise':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />
            {/* Step block under ball of foot */}
            <rect x="145" y="155" width="35" height="15" rx="2" fill="#1e3442" stroke="#2c4d61" strokeWidth="1.5" />

            {/* Athlete standing tall */}
            <circle cx="160" cy="50" r="9" fill="#486577" />
            <path d="M160 60 L160 115" stroke="#486577" strokeWidth="15" strokeLinecap="round" />
            {/* Legs straight */}
            <path d="M160 115 L160 148" stroke="#486577" strokeWidth="11" strokeLinecap="round" />
            
            {/* Gastrocnemius (Diamond calf) & Achilles Tendon */}
            <circle cx="162" cy="132" r="7" fill="#10b981" />
            <line x1="162" y1="138" x2="162" y2="152" stroke="#cbd5e1" strokeWidth="3" />
            
            {/* Heel elevated high on ball of foot */}
            <path d="M152 153 L162 148" stroke="#486577" strokeWidth="5" strokeLinecap="round" />
            
            {/* Upward explosive arrow */}
            <path d="M175 145 L175 125 M171 129 L175 125 L179 129" stroke="#ffc83b" strokeWidth="2" strokeLinecap="round" />

            <g transform="translate(170, 25)">
              <rect width="135" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="67" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Talón Arriba • Aquiles & Gemelo</text>
            </g>
          </svg>
        );

      // 18. Farmer's Walk (Paseo del Granjero)
      case 'farmers-walk':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />

            {/* Athlete walking with proud tall posture */}
            <circle cx="150" cy="55" r="9" fill="#486577" />
            {/* Rigid core highlighted */}
            <path d="M150 65 L150 115" stroke="#486577" strokeWidth="16" strokeLinecap="round" />
            <rect x="144" y="85" width="12" height="25" rx="3" fill="#10b981" />

            {/* Walking stride */}
            <path d="M150 115 L140 145 L135 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M150 115 L160 145 L168 170" stroke="#486577" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

            {/* Heavy kettlebell / dumbbell in hand */}
            <path d="M148 75 L150 110" stroke="#486577" strokeWidth="7" strokeLinecap="round" />
            <rect x="144" y="110" width="14" height="20" rx="3" fill="#cbd5e1" stroke="#10b981" strokeWidth="2" />
            <circle cx="151" cy="105" r="4" fill="none" stroke="#cbd5e1" strokeWidth="2" />

            {/* Movement stride arrow */}
            <path d="M185 110 L210 110 M205 106 L210 110 L205 114" stroke="#ffc83b" strokeWidth="2" strokeLinecap="round" />

            <g transform="translate(170, 25)">
              <rect width="135" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="67" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Paso Firme • Core Anti-Flexión</text>
            </g>
          </svg>
        );

      // Default / Side Plank fallback
      case 'side-plank':
      default:
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#091014" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#1c2d38" strokeWidth="2" strokeDasharray="4 4" />

            {/* Side plank straight line */}
            <circle cx="105" cy="115" r="8" fill="#486577" />
            {/* Supporting elbow */}
            <path d="M120 125 L120 170" stroke="#486577" strokeWidth="8" strokeLinecap="round" />
            {/* Straight bodyline */}
            <path d="M115 125 L215 165" stroke="#486577" strokeWidth="14" strokeLinecap="round" />
            {/* Oblique & Glute medius highlighted */}
            <path d="M140 135 L175 150" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            <circle cx="155" cy="142" r="7" fill="#10b981" />

            <g transform="translate(170, 25)">
              <rect width="135" height="24" rx="6" fill="#12232c" stroke="#234255" strokeWidth="1" />
              <text x="67" y="16" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Alineación Recta • Glúteo Medio</text>
            </g>
          </svg>
        );
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl bg-[#091014] ${className}`}>
      {renderVisual()}
    </div>
  );
}
