export interface Exercise {
  id: string;
  name: string;
  targetMuscles: string[];
  sets: string;
  reps: string;
  rest: string;
  rir: string; // Repeticiones en reserva (ej: "1-2 RIR")
  runningBenefit: string;
  cues: string[];
  imageUrl: string;
}

export interface TrainingDay {
  dayNumber: number;
  title: string;
  subtitle: string;
  focus: string;
  recommendedTiming: string;
  exercises: Exercise[];
}

export interface StrengthRoutine {
  id: string;
  name: string;
  badge: string;
  daysPerWeek: number;
  description: string;
  bestFor: string;
  days: TrainingDay[];
}

export const STRENGTH_ROUTINES: StrengthRoutine[] = [
  {
    id: 'split-hipertrofia-3dias',
    name: 'Split Estética & Hipertrofia (3 Días)',
    badge: 'Popular',
    daysPerWeek: 3,
    description: 'División clásica por grupos musculares antagónicos. Aísla el impacto de piernas a un único día para permitir el máximo rendimiento en tus carreras de fondo y series, logrando masa muscular real en el tren superior.',
    bestFor: 'Corredores que quieren ganar volumen muscular en pecho, espalda y brazos sin acumular fatiga constante en las piernas.',
    days: [
      {
        dayNumber: 1,
        title: 'Día 1: Pecho, Bíceps y Hombro',
        subtitle: 'Empuje horizontal, flexores de codo y deltoides',
        focus: 'Hipertrofia de tren superior. No compromete las piernas para los entrenamientos de carrera del día siguiente.',
        recommendedTiming: 'Ideal para lunes o martes. Puede coincidir con días de rodaje suave o series cortas.',
        exercises: [
          {
            id: 'bench-press',
            name: 'Press de Banca Plano (Barra o Mancuernas)',
            targetMuscles: ['Pectoral mayor', 'Tríceps', 'Deltoides anterior'],
            sets: '4',
            reps: '6 - 8',
            rest: '2 - 3 min',
            rir: 'RIR 1-2',
            runningBenefit: 'Genera fuerza estructural en el torso y caja torácica, mejorando la estabilidad del tronco en respiraciones forzadas.',
            cues: ['Retraé y deprimí las escápulas.', 'Pies firmes en el suelo.', 'Bajar controlado al esternón, empuje potente.'],
            imageUrl: '/exercises/bench-press.jpg'
          },
          {
            id: 'incline-db-press',
            name: 'Press Inclinado con Mancuernas (30° - 45°)',
            targetMuscles: ['Pectoral superior', 'Deltoides anterior'],
            sets: '3',
            reps: '8 - 10',
            rest: '90 seg',
            rir: 'RIR 2',
            runningBenefit: 'Desarrolla el pectoral superior y estabiliza el hombro, previniendo la fatiga clavicular en carreras largas.',
            cues: ['Codos a 45 grados del torso.', 'Rango completo sin despegar la espalda alta.'],
            imageUrl: '/exercises/incline-db-press.jpg'
          },
          {
            id: 'cable-flyes',
            name: 'Aperturas o Cruces en Polea',
            targetMuscles: ['Pectoral mayor (aislamiento)'],
            sets: '3',
            reps: '12 - 15',
            rest: '60 seg',
            rir: 'RIR 1',
            runningBenefit: 'Estimula hipertrofia sin fatiga neuromuscular excesiva.',
            cues: ['Ligera flexión de codos constante.', 'Apretar en el punto de contracción máxima 1 segundo.'],
            imageUrl: '/exercises/cable-flyes.jpg'
          },
          {
            id: 'ez-bar-curl',
            name: 'Curl de Bíceps con Barra Z o Mancuernas',
            targetMuscles: ['Bíceps braquial', 'Braquial anterior'],
            sets: '4',
            reps: '8 - 10',
            rest: '90 seg',
            rir: 'RIR 1-2',
            runningBenefit: 'Fortalece la flexión del codo a 90°, ángulo constante durante horas en un maratón.',
            cues: ['Codos pegados a los costados.', 'Evitar el balanceo lumbar.'],
            imageUrl: '/exercises/ez-bar-curl.jpg'
          },
          {
            id: 'hammer-curl',
            name: 'Curl Martillo con Mancuernas',
            targetMuscles: ['Braquiorradial', 'Braquial anterior'],
            sets: '3',
            reps: '10 - 12',
            rest: '60 seg',
            rir: 'RIR 1',
            runningBenefit: 'Aumenta el grosor del antebrazo y la fuerza de agarre, equilibrando la musculatura del brazo.',
            cues: ['Agarre neutro (palmas enfrentadas).', 'Subida controlada, descenso en 2 segundos.'],
            imageUrl: '/exercises/hammer-curl.jpg'
          },
          {
            id: 'lateral-raises',
            name: 'Elevaciones Laterales con Mancuernas o Polea',
            targetMuscles: ['Deltoides lateral'],
            sets: '3',
            reps: '12 - 15',
            rest: '60 seg',
            rir: 'RIR 1',
            runningBenefit: 'Proporciona amplitud en hombros, mejorando el balance aerodinámico y la presencia física.',
            cues: ['Elevar guiando con los codos.', 'No sobrepasar la línea del hombro.'],
            imageUrl: '/exercises/lateral-raises.jpg'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Día 2: Espalda, Tríceps y Deltoides Posterior',
        subtitle: 'Tracción vertical/horizontal, extensores de codo y postura',
        focus: 'Cadena posterior del torso. Vital para no "desarmar" la técnica de carrera cuando llega el cansancio del km 30.',
        recommendedTiming: 'Miércoles o jueves. Dejar al menos 48h de separación con el día de piernas o hacer el día antes de un descanso.',
        exercises: [
          {
            id: 'pull-ups',
            name: 'Dominadas (Lastradas o Asistidas) / Jalón al Pecho',
            targetMuscles: ['Dorsal ancho', 'Redondo mayor', 'Bíceps'],
            sets: '4',
            reps: '6 - 8',
            rest: '2 min',
            rir: 'RIR 1-2',
            runningBenefit: 'El dorsal conecta la escápula con la fascia toracolumbar y el glúteo opuesto: es el transmisor del braceo a la propulsión.',
            cues: ['Pecho al frente hacia la barra.', 'Traccionar desde los codos, no desde las manos.'],
            imageUrl: '/exercises/pull-ups.jpg'
          },
          {
            id: 'barbell-row',
            name: 'Remo con Barra o Mancuerna Pesado',
            targetMuscles: ['Dorsal medio', 'Romboides', 'Trapecio medio/inferior'],
            sets: '4',
            reps: '8 - 10',
            rest: '90 seg',
            rir: 'RIR 2',
            runningBenefit: 'Evita la cifosis dorsal (encorvarse hacia adelante) durante los kilómetros finales de un maratón.',
            cues: ['Torso a 45 grados, columna neutra.', 'Llevar la barra hacia la cadera/ombligo.'],
            imageUrl: '/exercises/barbell-row.jpg'
          },
          {
            id: 'cable-row-pullover',
            name: 'Remo en Polea Baja (Agarre Neutro) o Pullover',
            targetMuscles: ['Dorsal ancho', 'Redondo mayor'],
            sets: '3',
            reps: '10 - 12',
            rest: '60 seg',
            rir: 'RIR 1',
            runningBenefit: 'Aísla la contracción escapular y la amplitud de espalda.',
            cues: ['Mantener el pecho erguido al finalizar el tirón.'],
            imageUrl: '/exercises/cable-row-pullover.jpg'
          },
          {
            id: 'dips-french-press',
            name: 'Fondos en Paralelas (Dips) o Press Francés',
            targetMuscles: ['Tríceps (cabeza larga y lateral)', 'Pectoral inferior'],
            sets: '3',
            reps: '8 - 10',
            rest: '90 seg',
            rir: 'RIR 1-2',
            runningBenefit: 'Fuerza explosiva en brazos para empujar en cuestas empinadas y sprints finales.',
            cues: ['Bajar hasta 90° de flexión de codo.', 'Extensión controlada sin bloquear bruscamente.'],
            imageUrl: '/exercises/dips-french-press.jpg'
          },
          {
            id: 'triceps-rope-pushdown',
            name: 'Extensión de Tríceps en Polea con Cuerda',
            targetMuscles: ['Tríceps (aislamiento cabeza lateral)'],
            sets: '3',
            reps: '10 - 12',
            rest: '60 seg',
            rir: 'RIR 1',
            runningBenefit: 'Masa y definición muscular en el brazo.',
            cues: ['Separar las cuerdas al final del recorrido hacia los costados.'],
            imageUrl: '/exercises/triceps-rope-pushdown.jpg'
          },
          {
            id: 'face-pulls',
            name: 'Face Pulls en Polea con Cuerda',
            targetMuscles: ['Deltoides posterior', 'Manguito rotador', 'Trapecio'],
            sets: '3',
            reps: '15',
            rest: '60 seg',
            rir: 'RIR 2',
            runningBenefit: 'El ejercicio de salud escapular #1: previene contracturas en el cuello y hombros al correr relajado.',
            cues: ['Tirar la cuerda a la altura de la frente o nariz.', 'Rotar externamente las manos hacia atrás al final.'],
            imageUrl: ''
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Día 3: Piernas Completas, Sóleo Pesado y Core',
        subtitle: 'Fuerza máxima, elasticidad tendinosa, sóleo y estabilidad central',
        focus: 'El día neurálgico del corredor. Carga pesada para aumentar la rigidez del tendón de Aquiles, proteger rodillas y potenciar la zancada.',
        recommendedTiming: 'Hacerlo al menos 48h antes del fondo largo o el mismo día del entrenamiento de series (mañana series, tarde gym) para tener descanso total al día siguiente.',
        exercises: [
          {
            id: 'back-squat',
            name: 'Sentadilla Trasera con Barra (o Prensa a 45°)',
            targetMuscles: ['Cuádriceps', 'Glúteo mayor', 'Aductores'],
            sets: '4',
            reps: '5 - 6 (Carga pesada)',
            rest: '3 min',
            rir: 'RIR 2',
            runningBenefit: 'Reclutamiento de unidades motoras rápidas. Aumenta la economía de carrera (correr a la misma velocidad gastando menos oxígeno).',
            cues: ['Pies al ancho de hombros, puntas levemente abiertas.', 'Bajar al menos a paralelo sin despegar talones.', 'Empuje potente desde el suelo.'],
            imageUrl: '/exercises/back-squat.jpg'
          },
          {
            id: 'rdl-deadlift',
            name: 'Peso Muerto Rumano con Barra o Mancuernas (RDL)',
            targetMuscles: ['Isquiosurales', 'Glúteos', 'Erectores espinales'],
            sets: '4',
            reps: '6 - 8',
            rest: '2 min',
            rir: 'RIR 2',
            runningBenefit: 'Fortalece la fase excéntrica del isquiotibial al frenar la zancada en el aire, blindando contra desgarros musculares.',
            cues: ['Flexión mínima de rodillas.', 'Llevar la cadera hacia la pared de atrás manteniendo la espalda recta.'],
            imageUrl: ''
          },
          {
            id: 'bulgarian-split-squat',
            name: 'Sentadilla Búlgara con Mancuernas',
            targetMuscles: ['Cuádriceps', 'Glúteo medio', 'Estabilizadores de tobillo'],
            sets: '3',
            reps: '8 por pierna',
            rest: '90 seg',
            rir: 'RIR 1-2',
            runningBenefit: 'Al correr siempre estamos sobre una sola pierna. Elimina asimetrías de fuerza entre piernas y estabiliza la pelvis.',
            cues: ['Empeine apoyado en banco atrás.', 'Bajar la rodilla trasera en vertical sin dejar caer el torso.'],
            imageUrl: ''
          },
          {
            id: 'seated-calf-raise',
            name: 'Elevación de Talones Sentado en Máquina (Énfasis Sóleo)',
            targetMuscles: ['Sóleo (pantorrilla profunda)'],
            sets: '4',
            reps: '10 - 12 (Pesadas)',
            rest: '90 seg',
            rir: 'RIR 1',
            runningBenefit: 'CRUCIAL: El sóleo soporta entre 6 y 8 veces el peso de tu cuerpo en cada paso al correr. Al tener la rodilla doblada a 90°, el gastrocnemio se apaga y el sóleo carga todo el trabajo.',
            cues: ['Pausa de 2 segundos en el fondo para estirar fascia.', 'Subir explosivo y apretar arriba 1 segundo.'],
            imageUrl: '/exercises/seated-calf-raise.jpg'
          },
          {
            id: 'standing-calf-raise',
            name: 'Elevación de Talones de Pie con Carga',
            targetMuscles: ['Gastrocnemio', 'Tendón de Aquiles'],
            sets: '3',
            reps: '10 - 12',
            rest: '60 seg',
            rir: 'RIR 1',
            runningBenefit: 'Aumenta la rigidez del tendón de Aquiles, convirtiendo el pie en un resorte elástico natural.',
            cues: ['Rodillas completamente extendidas pero sin bloquear.', 'Rango completo de bajada y subida.'],
            imageUrl: ''
          },
          {
            id: 'farmers-walk',
            name: 'Paseo del Granjero (Farmer’s Walk) Pesado',
            targetMuscles: ['Core anti-flexión lateral', 'Trapecios', 'Antebrazos'],
            sets: '3',
            reps: '35 - 40 metros',
            rest: '90 seg',
            rir: 'Carga pesada',
            runningBenefit: 'Enseña al core a mantenerse rígido bajo impacto dinámico mientras las piernas se mueven.',
            cues: ['Mancuernas o kettlebells pesadas a los lados.', 'Caminar erguido con pasos firmes sin oscilar.'],
            imageUrl: ''
          }
        ]
      }
    ]
  },
  {
    id: 'full-body-concurrente-2dias',
    name: 'Full Body Eficiente (2 Días)',
    badge: 'Mantenimiento & Fuerza',
    daysPerWeek: 2,
    description: 'Rutina minimalista de alta densidad para semanas de mucho kilometraje (4-6 días de running). Trabaja todo el cuerpo dos veces por semana con ejercicios compuestos de máximo retorno neuromuscular.',
    bestFor: 'Corredores que no quieren pasar más de 2 días en el gimnasio y buscan preservar masa muscular y economía de carrera.',
    days: [
      {
        dayNumber: 1,
        title: 'Día A: Dominancia de Rodilla + Empuje + Sóleo',
        subtitle: 'Fuerza base y propulsión',
        focus: 'Sentadilla pesada, press superior, gemelo/sóleo y core.',
        recommendedTiming: 'Martes o miércoles, tras un día suave.',
        exercises: [
          {
            id: 'fb-squat',
            name: 'Sentadilla con Barra (Back o Front Squat)',
            targetMuscles: ['Cuádriceps', 'Glúteos', 'Core'],
            sets: '4',
            reps: '6',
            rest: '2.5 min',
            rir: 'RIR 2',
            runningBenefit: 'Economía de carrera y fuerza propulsiva.',
            cues: ['Bajar profundo y subir con fuerza.'],
            imageUrl: '/exercises/back-squat.jpg'
          },
          {
            id: 'fb-bench',
            name: 'Press de Banca o Fondos en Paralelas',
            targetMuscles: ['Pectoral', 'Tríceps', 'Hombro'],
            sets: '3',
            reps: '8 - 10',
            rest: '90 seg',
            rir: 'RIR 2',
            runningBenefit: 'Fuerza de empuje y solidez en el pecho.',
            cues: ['Controlar el descenso.'],
            imageUrl: '/exercises/bench-press.jpg'
          },
          {
            id: 'fb-seated-calf',
            name: 'Elevación de Talón Sentado (Sóleo Pesado)',
            targetMuscles: ['Sóleo'],
            sets: '4',
            reps: '10 - 12',
            rest: '90 seg',
            rir: 'RIR 1',
            runningBenefit: 'Prevención de periostitis tibial y tendinopatías de Aquiles.',
            cues: ['Pausa abajo de 2 seg.'],
            imageUrl: '/exercises/seated-calf-raise.jpg'
          },
          {
            id: 'fb-chins',
            name: 'Dominadas Supinas (Chin-ups)',
            targetMuscles: ['Dorsal', 'Bíceps'],
            sets: '3',
            reps: '6 - 8',
            rest: '90 seg',
            rir: 'RIR 1-2',
            runningBenefit: 'Hipertrofia de espalda y brazos en un solo movimiento.',
            cues: ['Rango completo.'],
            imageUrl: '/exercises/pull-ups.jpg'
          },
          {
            id: 'fb-pallof',
            name: 'Press Pallof con Polea o Banda',
            targetMuscles: ['Core anti-rotación', 'Oblicuos'],
            sets: '3',
            reps: '12 por lado',
            rest: '45 seg',
            rir: 'Tensión constante',
            runningBenefit: 'Estabilidad de pelvis en cada zancada.',
            cues: ['Brazos al frente sin dejar rotar el torso.'],
            imageUrl: ''
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Día B: Dominancia de Cadera + Tracción + Tobillos',
        subtitle: 'Cadena posterior y resiliencia',
        focus: 'Peso muerto, remo pesado, zancadas y estabilidad rotacional.',
        recommendedTiming: 'Viernes o sábado (dejando 48h antes del fondo dominical).',
        exercises: [
          {
            id: 'fb-deadlift',
            name: 'Peso Muerto Convencional o Trap Bar',
            targetMuscles: ['Glúteos', 'Isquios', 'Espalda completa'],
            sets: '4',
            reps: '5',
            rest: '3 min',
            rir: 'RIR 2',
            runningBenefit: 'Máxima potencia neuromuscular en la cadera.',
            cues: ['Empujar el suelo con los talones, mantener la barra pegada a las espinillas.'],
            imageUrl: ''
          },
          {
            id: 'fb-row',
            name: 'Remo con Barra o con Mancuerna a 1 Mano',
            targetMuscles: ['Dorsal', 'Romboides', 'Bíceps'],
            sets: '3',
            reps: '8 - 10',
            rest: '90 seg',
            rir: 'RIR 2',
            runningBenefit: 'Postura erecta contra la fatiga aeróbica.',
            cues: ['Tirar desde los codos.'],
            imageUrl: '/exercises/barbell-row.jpg'
          },
          {
            id: 'fb-lunge',
            name: 'Zancadas Caminando con Mancuernas',
            targetMuscles: ['Cuádriceps', 'Glúteo mayor y medio'],
            sets: '3',
            reps: '10 pasos por pierna',
            rest: '90 seg',
            rir: 'RIR 2',
            runningBenefit: 'Fuerza unilateral específica de locomoción.',
            cues: ['Paso amplio y rodilla que roza el suelo sin golpear.'],
            imageUrl: ''
          },
          {
            id: 'fb-standing-calf',
            name: 'Elevación de Talones Unilateral de Pie',
            targetMuscles: ['Gastrocnemio', 'Aquiles'],
            sets: '3',
            reps: '12 por pierna',
            rest: '60 seg',
            rir: 'RIR 1',
            runningBenefit: 'Reactividad elástica del pie en la fase de despegue.',
            cues: ['Subir en 1 seg, bajar en 3 seg.'],
            imageUrl: ''
          },
          {
            id: 'fb-side-plank',
            name: 'Plancha Lateral con Elevación de Pierna',
            targetMuscles: ['Glúteo medio', 'Cuadrado lumbar'],
            sets: '3',
            reps: '30 seg por lado',
            rest: '45 seg',
            rir: 'Control total',
            runningBenefit: 'Evita el síndrome de la cintilla iliotibial y caída de pelvis (signo de Trendelenburg).',
            cues: ['Cuerpo en una línea recta perfecta.'],
            imageUrl: ''
          }
        ]
      }
    ]
  }
];

export interface SynergyTip {
  title: string;
  description: string;
  ruleOfThumb: string;
}

export const RUNNING_STRENGTH_SYNERGY_TIPS: SynergyTip[] = [
  {
    title: 'La Regla de los Días Duros (Hard Days Hard)',
    description: 'Si hacés series de velocidad o cuestas por la mañana, hacé el entrenamiento de pierna pesada esa misma tarde (separado por 6 a 8 horas). De esa manera, acumulás el estrés neuromuscular el mismo día y el día siguiente es de verdadero descanso o recuperación activa.',
    ruleOfThumb: 'Nunca hagas piernas pesadas el día ANTES de un fondo largo o de series clave.'
  },
  {
    title: 'RIR: Entrenar Pesado pero sin Llegar al Fallo',
    description: 'En corredores, el fallo muscular extremo causa un daño en la unión mioneural que tarda hasta 72 horas en disiparse. Trabajar con RIR 1-2 (quedándote a 1 o 2 repeticiones de no poder más) da el 98% del estímulo hipertrófico y de fuerza sin arruinar tus ritmos de carrera.',
    ruleOfThumb: 'Si la repetición pierde la forma o se deforma la técnica, esa serie se terminó.'
  },
  {
    title: 'El Secreto del Sóleo (La Pantorrilla Oculta)',
    description: 'La mayoría de corredores solo hace elevaciones de gemelo de pie. Pero al correr, la rodilla está flexionada al absorber el impacto: ahí el gastrocnemio pierde palanca y el sóleo soporta hasta 8x tu peso. La única forma de aislar el sóleo es sentado con rodillas flexionadas a 90° con buen peso.',
    ruleOfThumb: 'Hacé al menos 4 series de elevación de talón sentado 1 o 2 veces por semana.'
  },
  {
    title: 'Nutrición para Ganar Masa Muscular Corriendo',
    description: 'Correr consume glucógeno vorazmente. Si querés ganar masa muscular en el gimnasio mientras corrés, necesitás asegurar entre 1.6 y 2.0 g de proteína por kg de peso corporal al día y no entrenar fuerza en ayunas completo.',
    ruleOfThumb: 'Consumí 20-30g de proteína de rápida asimilación e hidratos en las 2 horas posteriores al gym.'
  }
];
