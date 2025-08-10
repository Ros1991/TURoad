import { HistoricalPlace } from "../types";

/**
 * Dados mockados de locais com histórias incríveis
 */
export const mockedHistoricalPlaces: HistoricalPlace[] = [
  {
    id: "1",
    name: "Praça São Francisco",
    nameTranslations: {
      pt: "Praça São Francisco",
      en: "São Francisco Square",
      es: "Plaza São Francisco"
    },
    description: "Localizada no coração de São Cristóvão, é um dos conjuntos arquitetônicos coloniais mais importantes do Brasil, reconhecido como Patrimônio Mundial pela UNESCO.",
    descriptionTranslations: {
      pt: "Localizada no coração de São Cristóvão, é um dos conjuntos arquitetônicos coloniais mais importantes do Brasil, reconhecido como Patrimônio Mundial pela UNESCO.",
      en: "Located in the heart of São Cristóvão, it is one of the most important colonial architectural complexes in Brazil, recognized as a World Heritage Site by UNESCO.",
      es: "Ubicada en el corazón de São Cristóvão, es uno de los conjuntos arquitectónicos coloniales más importantes de Brasil, reconocido como Patrimonio Mundial por la UNESCO."
    },
    location: "São Cristóvão, SE - Centro histórico",
    locationTranslations: {
      pt: "São Cristóvão, SE - Centro histórico",
      en: "São Cristóvão, SE - Historic center",
      es: "São Cristóvão, SE - Centro histórico"
    },
    storiesCount: 8,
    image: "https://turoad.s3.us-east-1.amazonaws.com/pracasaofrancisco.png"
  },
  {
    id: "2",
    name: "Ponte do Imperador",
    nameTranslations: {
      pt: "Ponte do Imperador",
      en: "Emperor's Bridge",
      es: "Puente del Emperador"
    },
    description: "Ponte histórica construída no século XIX, importante marco da engenharia da época e cenário de diversas histórias e lendas locais.",
    descriptionTranslations: {
      pt: "Ponte histórica construída no século XIX, importante marco da engenharia da época e cenário de diversas histórias e lendas locais.",
      en: "Historic bridge built in the 19th century, important engineering landmark of the time and setting for various local stories and legends.",
      es: "Puente histórico construido en el siglo XIX, importante hito de la ingeniería de la época y escenario de diversas historias y leyendas locales."
    },
    location: "Maruim, SE - Rio Cotinguiba",
    locationTranslations: {
      pt: "Maruim, SE - Rio Cotinguiba",
      en: "Maruim, SE - Cotinguiba River",
      es: "Maruim, SE - Río Cotinguiba"
    },
    storiesCount: 3,
    image: "https://turoad.s3.us-east-1.amazonaws.com/ponteimperador.png"
  }
];
