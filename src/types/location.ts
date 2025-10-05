export interface CreateLocation {
  latitude: number;
  longitude: number;
  display_name: string;
}

export interface Location extends CreateLocation {
  _id: string;
}
