import { colors } from '../../tokens/colors';
import type { DemoMovie } from '../../types/content';

export const demoMovies: DemoMovie[] = [
  {
    id: 'dune-2',
    title: 'Duna: Parte Dois',
    synopsis: 'Paul Atreides une forcas a Chani e aos fremen enquanto busca vinganca contra os conspiradores que destruiram sua familia.',
    year: 2024,
    duration: 166,
    genres: ['Ficcao cientifica', 'Aventura', 'Drama'],
    rating: 4.8,
    posterSource: require('../../../assets/posters/dune-part-two.jpg'),
    posterColor: colors.surfaceHighlight,
    streamingServices: ['Max', 'Prime Video'],
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    synopsis: 'A trajetoria do fisico J. Robert Oppenheimer e as consequencias da criacao da primeira bomba atomica.',
    year: 2023,
    duration: 180,
    genres: ['Drama', 'Historia', 'Suspense'],
    rating: 4.6,
    posterSource: require('../../../assets/posters/oppenheimer.jpg'),
    posterColor: colors.primary,
    streamingServices: ['Prime Video', 'Apple TV'],
  },
  {
    id: 'spirited-away',
    title: 'A Viagem de Chihiro',
    synopsis: 'Uma menina entra em um mundo magico e precisa encontrar coragem para salvar os pais e voltar para casa.',
    year: 2001,
    duration: 125,
    genres: ['Animacao', 'Fantasia', 'Aventura'],
    rating: 4.9,
    posterSource: require('../../../assets/posters/spirited-away.jpg'),
    posterColor: colors.tierA,
    streamingServices: ['Netflix', 'Max'],
  },
  {
    id: 'parasite',
    title: 'Parasita',
    synopsis: 'Uma familia sem perspectivas se infiltra na rotina de uma familia rica, dando inicio a uma convivencia imprevisivel.',
    year: 2019,
    duration: 132,
    genres: ['Suspense', 'Drama', 'Comedia'],
    rating: 4.7,
    posterSource: require('../../../assets/posters/parasite.jpg'),
    posterColor: colors.surface,
    streamingServices: ['Prime Video', 'MUBI'],
  },
];

export const demoUser = {
  id: 'cinefilo-demo',
  name: 'Marina Costa',
  username: '@marinacine',
  bio: 'Entre um classico e uma ficcao cientifica, sempre cabe mais um filme.',
  favoriteMovieIds: ['dune-2', 'spirited-away', 'parasite'],
};