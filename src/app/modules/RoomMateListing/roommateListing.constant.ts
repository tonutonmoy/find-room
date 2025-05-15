export enum ListingStatus {
  PUBLISHED = "PUBLISHED",
  EXPIRED = "EXPIRED"
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  MIXED = "MIXED",
  ANY = "ANY"
}
export interface Saved {
  id: string;
  userId: string;
  listingId: string;
}
export interface ListingAmenity {
  id: string;
  listingId: string;
  amenityId: string;
}
export interface ListingRule {
  id: string;
  listingId: string;
  lifestyleRuleId: string;
}
