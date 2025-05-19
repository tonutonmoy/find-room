import { IListing } from "../RoomMateListing/roommateListing.interface";
import { IUser } from "../User/user.interface";

export interface ISaveRoom {
  id: string;
  userId: string;
  user: IUser; // Define or import the IUser interface
 matchScore:number;
  listingId: string;
  listing: IListing; // Define or import the IListing interface
}
