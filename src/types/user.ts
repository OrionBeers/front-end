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

export type { UserAuthResponse }