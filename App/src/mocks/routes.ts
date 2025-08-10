import { Route } from "../types";

/**
 * Dados mockados de rotas turísticas
 */
export const mockedRoutes: Route[] = [
  {
    id: "1",
    title: "Caminhos da Memória Sergipana",
    titleTranslations: {
      pt: "Caminhos da Memória Sergipana",
      en: "Paths of Sergipe's Memory",
      es: "Caminos de la Memoria de Sergipe"
    },
    description: "Viaje pelas cidades que guardam as origens, lutas e tradições do povo sergipano.",
    descriptionTranslations: {
      pt: "Viaje pelas cidades que guardam as origens, lutas e tradições do povo sergipano.",
      en: "Travel through cities that preserve the origins, struggles and traditions of the Sergipe people.",
      es: "Viaja por las ciudades que guardan los orígenes, luchas y tradiciones del pueblo sergipano."
    },
    categories: ["2"], // História
    totalDistance: "51 km",
    estimatedDuration: "3 horas",
    stops: 3,
    stories: 2, // Total de histórias em todas as cidades desta rota
    cities: [
      {
        id: "1",
        name: "Aracaju",
        state: "Sergipe",
        image: "https://turoad.s3.us-east-1.amazonaws.com/aracaju.png",
        descriptionTranslations: {
          pt: "Capital de Sergipe, Aracaju combina modernidade com tranquilidade litorânea. Conhecida por sua orla organizada, culinária baseada em frutos do mar e um estilo de vida acolhedor, a cidade atrai turistas e moradores pela qualidade de vida e infraestrutura urbana.",
          en: "Capital of Sergipe, Aracaju combines modernity with coastal tranquility. Known for its organized waterfront, seafood-based cuisine and welcoming lifestyle, the city attracts tourists and residents by its quality of life and urban infrastructure.",
          es: "Capital de Sergipe, Aracaju combina modernidad con tranquilidad costera. Conocida por su frente marítimo organizado, cocina basada en mariscos y estilo de vida acogedor, la ciudad atrae turistas y residentes por su calidad de vida e infraestructura urbana."
        },
        totalDistance: "25 km",
        highlights: ["Orla de Atalaia", "Oceanário", "Mercado Municipal"],
        stories: [
          {
            id: "story-aracaju-1",
            title: "A Fundação de Aracaju",
            titleTranslations: {
              pt: "A Fundação de Aracaju",
              en: "The Foundation of Aracaju",
              es: "La Fundación de Aracaju"
            },
            description: "A história da fundação da capital sergipana em 1855.",
            descriptionTranslations: {
              pt: "A história da fundação da capital sergipana em 1855.",
              en: "The history of the founding of the capital of Sergipe in 1855.",
              es: "La historia de la fundación de la capital sergipana en 1855."
            },
            duration: "8 min",
            audioUrl: "https://example.com/aracaju-fundacao.mp3",
            audioUrlTranslations: {
              pt: "https://turoad.s3.us-east-1.amazonaws.com/pt/aracaju-fundacao.mp3",
              en: "https://turoad.s3.us-east-1.amazonaws.com/en/aracaju-foundation.mp3",
              es: "https://turoad.s3.us-east-1.amazonaws.com/es/aracaju-fundacion.mp3"
            },
            narrator: "José Silva"
          },
          {
            id: "1",
            title: "Introdução à cidade de Aracaju",
            titleTranslations: {
              pt: "Introdução à cidade de Aracaju",
              en: "Introduction to the city of Aracaju",
              es: "Introducción a la ciudad de Aracaju"
            },
            description: "A Cidade Que Nasceu Planejada",
            descriptionTranslations: {
              pt: "A Cidade Que Nasceu Planejada",
              en: "The City That Was Born Planned",
              es: "La Ciudad Que Nació Planeada"
            },
            duration: "3:40",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            audioUrlTranslations: {
              pt: "https://turoad.s3.us-east-1.amazonaws.com/pt/aracaju-introducao.mp3",
              en: "https://turoad.s3.us-east-1.amazonaws.com/en/aracaju-introduction.mp3",
              es: "https://turoad.s3.us-east-1.amazonaws.com/es/aracaju-introduccion.mp3"
            },
            narrator: "Líderes comunitários"
          }
        ]
      }
    ],
    image: "https://turoad.s3.us-east-1.amazonaws.com/caminhos.png",
  },
  {
    id: "2",
    title: "Entre Igrejas e Império: Passado Vivo de Sergipe",
    titleTranslations: {
      pt: "Entre Igrejas e Império: Passado Vivo de Sergipe",
      en: "Between Churches and Empire: Living Past of Sergipe",
      es: "Entre Iglesias e Imperio: Pasado Vivo de Sergipe"
    },
    description: "Dos altares barrocos aos casarões coloniais, explore cidades que preservam a alma histórica de Sergipe.",
    descriptionTranslations: {
      pt: "Dos altares barrocos aos casarões coloniais, explore cidades que preservam a alma histórica de Sergipe.",
      en: "From baroque altars to colonial mansions, explore cities that preserve the historical soul of Sergipe.",
      es: "De los altares barrocos a las mansiones coloniales, explora ciudades que conservan el alma histórica de Sergipe."
    },
    categories: ["1", "2"], // Gastronomia e História
    totalDistance: "64 km",
    estimatedDuration: "4 horas",
    stops: 5,
    stories: 1, // Total de histórias em todas as cidades desta rota
    cities: [
      {
        id: "2",
        name: "São Cristóvão",
        state: "Sergipe",
        image: "https://via.placeholder.com/300x200/8B4513/FFFFFF?text=São+Cristóvão",
        descriptionTranslations: {
          pt: "Primeira capital de Sergipe, São Cristóvão é um patrimônio histórico vivo com arquitetura colonial preservada e tradições centenárias.",
          en: "First capital of Sergipe, São Cristóvão is a living historical heritage with preserved colonial architecture and centuries-old traditions.",
          es: "Primera capital de Sergipe, São Cristóvão es un patrimonio histórico vivo con arquitectura colonial preservada y tradiciones centenarias."
        },
        totalDistance: "20 km",
        highlights: ["Centro Histórico", "Igreja do Carmo", "Museu de Arte Sacra"],
        stories: [
          {
            id: "story-sao-cristovao-1",
            title: "A Primeira Capital",
            titleTranslations: {
              pt: "A Primeira Capital",
              en: "The First Capital",
              es: "La Primera Capital"
            },
            description: "Como São Cristóvão se tornou a primeira capital de Sergipe.",
            descriptionTranslations: {
              pt: "Como São Cristóvão se tornou a primeira capital de Sergipe.",
              en: "How São Cristóvão became the first capital of Sergipe.",
              es: "Cómo São Cristóvão se convirtió en la primera capital de Sergipe."
            },
            duration: "6 min",
            audioUrl: "https://example.com/sao-cristovao-capital.mp3",
            audioUrlTranslations: {
              pt: "https://turoad.s3.us-east-1.amazonaws.com/pt/sao-cristovao-capital.mp3",
              en: "https://turoad.s3.us-east-1.amazonaws.com/en/sao-cristovao-first-capital.mp3",
              es: "https://turoad.s3.us-east-1.amazonaws.com/es/sao-cristovao-primera-capital.mp3"
            },
            narrator: "Maria Santos"
          }
        ]
      }
    ],
    image: "https://turoad.s3.us-east-1.amazonaws.com/rotagastro.png",
  },
  {
    id: "3",
    title: "Caminhos do Velho Chico: Natureza e Vida Ribeirinha",
    titleTranslations: {
      pt: "Caminhos do Velho Chico: Natureza e Vida Ribeirinha",
      en: "Old Chico's Paths: Nature and Riverside Life",
      es: "Caminos del Viejo Chico: Naturaleza y Vida Ribereña"
    },
    description: "Explore a natureza exuberante e a vida ribeirinha ao longo do Rio São Francisco.",
    descriptionTranslations: {
      pt: "Explore a natureza exuberante e a vida ribeirinha ao longo do Rio São Francisco.",
      en: "Explore the lush nature and riverside life along the São Francisco River.",
      es: "Explora la naturaleza exuberante y la vida ribereña a lo largo del Río São Francisco."
    },
    categories: ["4"], // Natureza
    totalDistance: "120 km",
    estimatedDuration: "6 horas",
    stops: 4,
    stories: 1, // Total de histórias em todas as cidades desta rota
    cities: [
      {
        id: "3",
        name: "Propriá",
        state: "Sergipe",
        image: "https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Propriá",
        descriptionTranslations: {
          pt: "Às margens do Rio São Francisco, Propriá preserva a cultura ribeirinha e oferece paisagens naturais deslumbrantes.",
          en: "On the banks of the São Francisco River, Propriá preserves riverside culture and offers stunning natural landscapes.",
          es: "A orillas del Río São Francisco, Propriá preserva la cultura ribereña y ofrece paisajes naturales deslumbrantes."
        },
        totalDistance: "40 km",
        highlights: ["Porto do Rio", "Centro Cultural", "Mercado de Peixe"],
        stories: [
          {
            id: "story-propria-1",
            title: "Vida no Velho Chico",
            titleTranslations: {
              pt: "Vida no Velho Chico",
              en: "Life on the Old Chico",
              es: "Vida en el Viejo Chico"
            },
            description: "A tradição pesqueira e a vida ribeirinha em Propriá.",
            descriptionTranslations: {
              pt: "A tradição pesqueira e a vida ribeirinha em Propriá.",
              en: "The fishing tradition and riverside life in Propriá.",
              es: "La tradición pesquera y la vida ribereña en Propriá."
            },
            duration: "10 min",
            audioUrl: "https://example.com/propria-rio.mp3",
            audioUrlTranslations: {
              pt: "https://turoad.s3.us-east-1.amazonaws.com/pt/propria-rio.mp3",
              en: "https://turoad.s3.us-east-1.amazonaws.com/en/propria-river.mp3",
              es: "https://turoad.s3.us-east-1.amazonaws.com/es/propria-rio.mp3"
            },
            narrator: "João Pescador"
          }
        ]
      }
    ],
    image: "https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=River+Route",
  },
  {
    id: "4",
    title: "Entre Mangues e Cânions: Paisagens Selvagens de Sergipe",
    titleTranslations: {
      pt: "Entre Mangues e Cânions: Paisagens Selvagens de Sergipe",
      en: "Between Mangroves and Canyons: Wild Landscapes of Sergipe",
      es: "Entre Manglares y Cañones: Paisajes Salvajes de Sergipe"
    },
    description: "Descubra paisagens selvagens entre mangues e cânions únicos de Sergipe.",
    descriptionTranslations: {
      pt: "Descubra paisagens selvagens entre mangues e cânions únicos de Sergipe.",
      en: "Discover wild landscapes between mangroves and unique canyons of Sergipe.",
      es: "Descubre paisajes salvajes entre manglares y cañones únicos de Sergipe."
    },
    categories: ["4"], // Natureza
    totalDistance: "85 km",
    estimatedDuration: "5 horas",
    stops: 3,
    stories: 1, // Total de histórias em todas as cidades desta rota
    cities: [
      {
        id: "4",
        name: "Canindé de São Francisco",
        state: "Sergipe",
        image: "https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Canindé",
        descriptionTranslations: {
          pt: "Portal dos Cânions do São Francisco, Canindé oferece paisagens selvagens únicas e formações rochosas impressionantes.",
          en: "Gateway to the São Francisco Canyons, Canindé offers unique wild landscapes and impressive rock formations.",
          es: "Puerta de entrada a los Cañones del São Francisco, Canindé ofrece paisajes salvajes únicos e impresionantes formaciones rocosas."
        },
        totalDistance: "35 km",
        highlights: ["Cânions do Xingó", "Rio São Francisco", "Usina Hidrelétrica"],
        stories: [
          {
            id: "story-caninde-1",
            title: "Formação dos Cânions",
            titleTranslations: {
              pt: "Formação dos Cânions",
              en: "Formation of the Canyons",
              es: "Formación de los Cañones"
            },
            description: "Como se formaram os impressionantes cânions do São Francisco.",
            descriptionTranslations: {
              pt: "Como se formaram os impressionantes cânions do São Francisco.",
              en: "How the impressive canyons of the São Francisco were formed.",
              es: "Cómo se formaron los impresionantes cañones del São Francisco."
            },
            duration: "7 min",
            audioUrl: "https://example.com/caninde-canions.mp3",
            audioUrlTranslations: {
              pt: "https://turoad.s3.us-east-1.amazonaws.com/pt/caninde-canions.mp3",
              en: "https://turoad.s3.us-east-1.amazonaws.com/en/caninde-canyons.mp3",
              es: "https://turoad.s3.us-east-1.amazonaws.com/es/caninde-canyons.mp3"
            },
            narrator: "Dr. Geologia"
          }
        ]
      }
    ],
    image: "https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Wild+Landscapes",
  },
];
