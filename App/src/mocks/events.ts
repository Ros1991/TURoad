import { Event } from "../types";

/**
 * Dados mockados de eventos
 */
export const mockedEvents: Event[] = [
  {
    id: "1",
    name: "Arraiá do Povo 2025",
    nameTranslations: {
      pt: "Arraiá do Povo 2025",
      en: "People's June Festival 2025",
      es: "Festival Junino del Pueblo 2025"
    },
    type: "Festa junina",
    typeTranslations: {
      pt: "Festa junina",
      en: "June Festival",
      es: "Festa junina"
    },
    location: "Orla de Atalaia, Aracaju",
    locationTranslations: {
      pt: "Orla de Atalaia, Aracaju",
      en: "Atalaia Waterfront, Aracaju",
      es: "Orla de Atalaia, Aracaju"
    },
    date: "10 de junho a 29 de junho",
    time: "a partir das 19h",
    image: "https://turoad.s3.us-east-1.amazonaws.com/arraiapovo.png"
  },
  {
    id: "2",
    name: "Forró Caju",
    nameTranslations: {
      pt: "Forró Caju",
      en: "Forró Caju",
      es: "Forró Caju"
    },
    type: "Festival de música",
    typeTranslations: {
      pt: "Festival de música",
      en: "Music Festival",
      es: "Festival de música"
    },
    location: "Aterro da Praia 13 de Julho",
    locationTranslations: {
      pt: "Aterro da Praia 13 de Julho",
      en: "13th of July Beach Landfill",
      es: "Aterro da Praia 13 de Julho"
    },
    date: "15 de dezembro a 31 de dezembro",
    time: "a partir das 20h",
    image: "https://turoad.s3.us-east-1.amazonaws.com/forrocaju.png"
  }
];
