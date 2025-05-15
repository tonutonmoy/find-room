import { IListing } from "../RoomMateListing/roommateListing.interface";
import { IUser } from "../User/user.interface";

export interface IRequest {
  id: string;
  userId: string;
  user: IUser; // Define or import the IUser interface
  requestStatus: RequestStatus; // Enum type (define this enum separately)
  listingId: string;
  listing: IListing; // Define or import the IListing interface
}
export enum RequestStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Expired = "Expired"
}
