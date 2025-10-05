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

import type { Location } from "./location";

type UserProfile = UserAuthResponse & {
  locations?: Location[];
};

export type { UserAuthResponse, UserProfile };
