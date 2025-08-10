import { City } from "../types";

/**
 * Dados mockados de cidades
 */
export const mockedCities: City[] = [
  {
    id: "1",
    name: "Aracaju",
    state: "Sergipe",
    image: "https://turoad.s3.us-east-1.amazonaws.com/aracaju.png",
    descriptionTranslations: {
      pt: "Capital de Sergipe, Aracaju combina modernidade com tranquilidade litorânea. Conhecida por sua orla organizada, culinária baseada em frutos do mar e um estilo de vida acolhedor, a cidade atrai turistas e moradores pela qualidade de vida e infraestrutura urbana.",
      en: "Capital of Sergipe, Aracaju combines modernity with litorânea tranquility. Known for its organized beach, seafood-based cuisine and welcoming lifestyle, the city attracts tourists and residents by its quality of life and urban infrastructure.",
      es: "Capital de Sergipe, Aracaju combina modernidad con tranquilidad litoránea. Conocida por su orla organizada, cocina baseada en frutos del mar y un estilo de vida acogedor, la ciudad atrae turistas y residentes por su calidad de vida y infraestructura urbana."
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
          pt: "https://turoad.s3.us-east-1.amazonaws.com/aracaju_portuguese.wav",
          en: "https://turoad.s3.us-east-1.amazonaws.com/aracaju_english.wav",
          es: "https://turoad.s3.us-east-1.amazonaws.com/aracaju_spanish.wav"
        },
        narrator: "José Silva"
      },
      {
        id: "story-aracaju-2",
        title: "Lendas da Orla de Atalaia",
        titleTranslations: {
          pt: "Lendas da Orla de Atalaia",
          en: "Legends of Atalaia Waterfront",
          es: "Leyendas de la Orla de Atalaia"
        },
        description: "Contos e lendas populares da famosa orla aracajuana.",
        descriptionTranslations: {
          pt: "Contos e lendas populares da famosa orla aracajuana.",
          en: "Popular tales and legends from the famous Aracaju waterfront.",
          es: "Cuentos y leyendas populares de la famosa orla aracajuana."
        },
        duration: "6 min",
        audioUrl: "https://example.com/aracaju-orla.mp3",
        audioUrlTranslations: {
          pt: "https://turoad.s3.us-east-1.amazonaws.com/sergipe_portuguese.wav",
          en: "https://turoad.s3.us-east-1.amazonaws.com/sergipe_english.wav",
          es: "https://turoad.s3.us-east-1.amazonaws.com/sergipe_spanish.wav"
        },
        narrator: "Maria Santos"
      },
    ],
    isPopular: true
  },
  {
    id: "2",
    name: "Nossa Senhora do Socorro",
    state: "Sergipe",
    image: "https://turoad.s3.us-east-1.amazonaws.com/nossasenhora.png",
    descriptionTranslations: {
      pt: "Segunda cidade mais populosa de Sergipe, integra a região metropolitana de Aracaju. Tem forte presença residencial e comercial, com destaque para suas feiras populares, bairros movimentados e rápido crescimento urbano.",
      en: "Second most populous city in Sergipe, integrates the metropolitan region of Aracaju. Has strong residential and commercial presence, with highlights for its popular fairs, bustling neighborhoods and rapid urban growth.",
      es: "Segunda ciudad más poblada de Sergipe, integra la región metropolitana de Aracaju. Tiene fuerte presencia residencial y comercial, con destaque para sus ferias populares, barrios movimientos y rápido crecimiento urbano."
    },
    totalDistance: "18 km",
    highlights: ["Praça São Francisco", "Museu Histórico", "Igreja Nossa Senhora do Rosário"],
    stories: [
      {
        id: "story-socorro-1",
        title: "Os Primórdios do Socorro",
        titleTranslations: {
          pt: "Os Primórdios do Socorro",
          en: "The Early Days of Socorro",
          es: "Los Primeros Tiempos del Socorro"
        },
        description: "A história dos primeiros colonizadores da região.",
        descriptionTranslations: {
          pt: "A história dos primeiros colonizadores da região.",
          en: "The history of the first settlers in the region.",
          es: "La historia de los primeros colonizadores de la región."
        },
        duration: "7 min",
        audioUrl: "https://example.com/socorro-primordios.mp3",
        audioUrlTranslations: {
          pt: "https://turoad.s3.us-east-1.amazonaws.com/pt/socorro-primordios.mp3",
          en: "https://turoad.s3.us-east-1.amazonaws.com/en/socorro-early-days.mp3",
          es: "https://turoad.s3.us-east-1.amazonaws.com/es/socorro-primeros-tiempos.mp3"
        },
        narrator: "Ana Costa"
      }
    ],
    isPopular: true
  },
];
