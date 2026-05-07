// ─── Preguntas educativas sobre el cuidado del agua ───
// Cada pregunta tiene: texto, 4 opciones y el índice de la respuesta correcta (0-based)

export const PREGUNTAS = [
  {
    id: 1,
    emoji: "🌊",
    pregunta: "¿Cuál es el río que nace en el lago Nahuel Huapi y abastece de agua a gran parte de la región?",
    opciones: [
      "Río Limay",
      "Río Colorado",
      "Río Paraná",
      "Río Grande",
    ],
    correcta: 0,
    dato: "¡El Río Limay nace en el Lago Nahuel Huapi y es clave para el agua de la región patagónica!"
  },
  {
    id: 2,
    emoji: "🚰",
    pregunta: "¿Cuántos litros de agua se desperdician si dejás el grifo abierto mientras te lavás los dientes?",
    opciones: [
      "Solo unas gotas",
      "Hasta 10 litros por minuto",
      "1 litro en total",
      "50 litros",
    ],
    correcta: 1,
    dato: "¡Con el grifo cerrado mientras te cepillás, podés ahorrar hasta 10 litros de agua por minuto!"
  },
  {
    id: 3,
    emoji: "🏔️",
    pregunta: "¿Qué dos ríos se unen para formar el Río Negro, uno de los más importantes de la Patagonia?",
    opciones: [
      "Río Limay y Río Colorado",
      "Río Neuquén y Río Limay",
      "Río Negro y Río Bariloche",
      "Río Grande y Río Sur",
    ],
    correcta: 1,
    dato: "¡El Río Neuquén y el Río Limay se unen en la ciudad de Neuquén para formar el majestuoso Río Negro!"
  },
  {
    id: 4,
    emoji: "🌵",
    pregunta: "¿Por qué se dice que Neuquén está en una zona árida o semiárida?",
    opciones: [
      "Porque hace mucho frío todo el año",
      "Porque tiene muchos desiertos de arena",
      "Porque llueve muy poco y el agua dulce es muy escasa",
      "Porque no tiene ríos cerca",
    ],
    correcta: 2,
    dato: "En zonas áridas como Neuquén, el agua dulce es un recurso muy valioso. ¡Por eso hay que cuidarla tanto!"
  },
  {
    id: 5,
    emoji: "💧",
    pregunta: "¿Qué porcentaje del agua de la Tierra es agua dulce que podemos tomar?",
    opciones: [
      "El 50%",
      "El 25%",
      "Menos del 3%",
      "El 70%",
    ],
    correcta: 2,
    dato: "¡Solo el 3% del agua del planeta es dulce! Y gran parte está congelada. Por eso es tan importante cuidarla."
  },
  {
    id: 6,
    emoji: "🏢",
    pregunta: "¿Cuál es el nombre de la empresa que provee agua potable en la provincia de Neuquén?",
    opciones: [
      "EPEN",
      "EPAS",
      "AySA",
      "YPF",
    ],
    correcta: 1,
    dato: "¡EPAS (Ente Provincial de Agua y Saneamiento) trabaja todos los días para que tengas agua limpia en casa!"
  },
  {
    id: 7,
    emoji: "🌱",
    pregunta: "¿Cuál es la mejor forma de regar las plantas para ahorrar agua?",
    opciones: [
      "Con manguera al mediodía cuando hay más sol",
      "Dejar que llueva solamente",
      "Regar temprano a la mañana o a la noche",
      "Usar una pileta llena",
    ],
    correcta: 2,
    dato: "¡Regar a la mañana o de noche evita que el sol evapore el agua rápidamente. Así las plantas beben más!"
  },
  {
    id: 8,
    emoji: "🔧",
    pregunta: "¿Qué debemos hacer si vemos una canilla que gotea en casa?",
    opciones: [
      "Ignorarla, es solo una gotita",
      "Taparla con un trapo y olvidarse",
      "Poner un balde y llenarlo",
      "Avisar a un adulto para que la arregle cuanto antes",
    ],
    correcta: 3,
    dato: "¡Una canilla que gotea puede desperdiciar hasta 30 litros de agua por día! Siempre hay que arreglarla."
  },
  {
    id: 9,
    emoji: "🚿",
    pregunta: "¿Qué acción ahorra más agua al bañarse?",
    opciones: [
      "Bañarse en bañera llena todos los días",
      "Ducharse en 5 minutos y cerrar el agua mientras te enjabonás",
      "Dejar la ducha abierta mientras buscás la ropa",
      "Bañarse dos veces por día con agua caliente",
    ],
    correcta: 1,
    dato: "¡Una ducha de 5 minutos usa solo 60 litros, mientras que una bañera llena puede usar ¡200 litros!"
  },
  {
    id: 10,
    emoji: "🤝",
    pregunta: "¿Qué podés hacer VOS para ser un verdadero Guardián del Agua?",
    opciones: [
      "Decirle a tus amigos que el agua es infinita",
      "Cerrar las canillas, ducharte rápido y avisar si hay pérdidas",
      "Usar el agua sin límite porque es barata",
      "Solo los adultos pueden cuidar el agua",
    ],
    correcta: 1,
    dato: "¡Todos podemos ser Guardianes del Agua! Pequeñas acciones como cerrar la canilla hacen una gran diferencia."
  },
  {
    id: 11,
    emoji: "🧠",
    pregunta: "¿Por qué es tan importante tomar agua para nuestro cerebro?",
    opciones: [
      "Porque el cerebro es 75% agua y sin ella nos duele la cabeza.",
      "Para que el pelo nos crezca mucho más rápido.",
      "Porque el agua le da superpoderes de memoria.",
      "Para poder pensar en nuevos colores."
    ],
    correcta: 0,
    dato: "¡El cerebro es 75% agua! Por eso una pequeña deshidratación puede causar dolor de cabeza y mareos."
  },
  {
    id: 12,
    emoji: "🫁",
    pregunta: "¿Qué pasaría con nuestros pulmones si no tuvieran agua y se secaran?",
    opciones: [
      "Respiraríamos el doble de rápido.",
      "No podríamos respirar.",
      "Podríamos respirar bajo el agua como los peces.",
      "Se inflarían como globos de cumpleaños."
    ],
    correcta: 1,
    dato: "¡Si nuestros pulmones no estuvieran siempre húmedos, no podríamos respirar! Nuestro cuerpo es casi 2/3 agua."
  },
  {
    id: 13,
    emoji: "💧",
    pregunta: "¿Cómo debe ser el agua potable (la que es segura para tomar)?",
    opciones: [
      "Debe ser transparente, sin olor, sin sabor raro y tener controles.",
      "Debe ser de color verde brillante y oler a menta.",
      "Puede tener basuritas flotando si viene del río.",
      "Tiene que tener mucho gas como las gaseosas."
    ],
    correcta: 0,
    dato: "¡El agua potable debe ser prácticamente incolora, inodora, limpia y someterse a tratamientos para que no tenga bacterias!"
  },
  {
    id: 14,
    emoji: "🦠",
    pregunta: "¿Qué pasa si tomamos agua 'no segura' (que no fue tratada por el EPAS)?",
    opciones: [
      "No pasa nada, toda el agua del mundo se puede tomar.",
      "Nos da muchísima más fuerza y energía para jugar.",
      "Nos puede producir enfermedades y dolor de panza.",
      "Nos cambia el color de los ojos a celeste."
    ],
    correcta: 2,
    dato: "¡El agua no segura proviene de fuentes no controladas y puede contener bacterias o sustancias que nos hacen mal!"
  },
  {
    id: 15,
    emoji: "🏞️",
    pregunta: "¿Cuál es una de las principales tomas de agua que abastece a la ciudad de Neuquén?",
    opciones: [
      "El Océano Atlántico.",
      "El Río de la Plata.",
      "Una montaña de nieve en el norte.",
      "El Lago Mari Menuco."
    ],
    correcta: 3,
    dato: "¡La toma del Lago Mari Menuco es clave para el Sistema de Agua Potable de la ciudad de Neuquén!"
  }
];

// ─── Mensajes de feedback positivo ───
export const MENSAJES_CORRECTA = ["¡GENIAL! 🎉", "¡SPLASH! 💧", "¡INCREÍBLE! ⭐", "¡SUPER! 🌊", "¡PERFECTO! 💎"];

// ─── Mensajes de feedback negativo ───
export const MENSAJES_INCORRECTA = ["¡Casi! 😅", "¡Intentá de nuevo! 💪", "¡No te rindas! 🌊", "¡Seguí intentando! 🎯"];
