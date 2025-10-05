type UserAuthResponse = {
  _id: string;
  name: string;
  email: string;
  id_google: string;
  avatar: string;
  created_at: string;
  updated_at: string;
  is_onboarding: boolean;
};

import type { Location } from "./location";

type UserProfile = UserAuthResponse & {
  locations?: Location[];
};

export type { UserAuthResponse, UserProfile };
