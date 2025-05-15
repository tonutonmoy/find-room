// GeoJSON Location type
interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Roommate Interface
export interface Roommate {
  id: string;
  image: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string; // Can be Date object or ISO string
  languageSpoken: string;
  age: number;
  gender: string;
  interests: string[];
  university: string;
  instagram?: string;
  listingId: string;
}

// Listing Interface
export interface IListing {
  id: string;
  title: string;
  description: string;
  preview: string;
  streetNumber: string;
  postCode: string;
  city: string;
  floor: number;
  rooms: number;
  bathrooms: number;
  size: number;
  availableFrom: Date | string;
  rentCHF: number;
  amenitiesAndServices: string[];
  additionalExpenses: boolean;
  houseAtmosphere: string;
  externalGuests: string;
  smokingAllowed: string;
  clearScheduleDefine: string;
  currentyPets: string;
  newPets: string;
  cooking: string;
  dinner: string;
  spendingFreeTime: string;
  language: string;
  age: number;
  gender: string;
  status: 'Published' | 'Expired' | 'Deactivated'; // Based on your Zod usage
  location: GeoLocation;
  searchRadius: number;
  userId: string;
  roommate: Roommate[];
}
