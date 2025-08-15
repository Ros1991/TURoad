// Export base repository
export { BaseRepository } from '@/core/base/BaseRepository';

// Export specific repositories
export { UserRepository } from './UserRepository';
export { JwtTokenRepository } from './JwtTokenRepository';
export { CategoryRepository } from './CategoryRepository';
export { CityRepository } from './CityRepository';
export { RouteRepository } from './RouteRepository';
export { LocationRepository } from './LocationRepository';
export { EventRepository } from './EventRepository';
export { TypeRepository } from './TypeRepository';
export { FAQRepository } from './FAQRepository';
export { LocalizedTextRepository } from './LocalizedTextRepository';

// Export singleton instances
import { UserRepository } from './UserRepository';
import { JwtTokenRepository } from './JwtTokenRepository';
import { CategoryRepository } from './CategoryRepository';
import { CityRepository } from './CityRepository';
import { RouteRepository } from './RouteRepository';
import { LocationRepository } from './LocationRepository';
import { EventRepository } from './EventRepository';
import { TypeRepository } from './TypeRepository';
import { FAQRepository } from './FAQRepository';
import { LocalizedTextRepository } from './LocalizedTextRepository';

export const userRepository = new UserRepository()
export const jwtTokenRepository = new JwtTokenRepository()
export const categoryRepository = new CategoryRepository()
export const cityRepository = new CityRepository()
export const routeRepository = new RouteRepository()
export const locationRepository = new LocationRepository()
export const eventRepository = new EventRepository()
export const typeRepository = new TypeRepository()
export const faqRepository = new FAQRepository()
export const localizedTextRepository = new LocalizedTextRepository()
