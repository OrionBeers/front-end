type UserAuthResponse = {
  _id: string;
  name: string;
  email: string;
  id_google: string;
  avatar: string;
  historical_data: [];
  created_at: string;
  updated_at: string;
};

type UserProfile = UserAuthResponse & {
  location?: {
    latitude: number;
    longitude: number;
    country?: string;
    region?: string;
    displayName?: string;
  };
};

export type { UserAuthResponse, UserProfile }