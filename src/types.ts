export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export type Comment = {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
};

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: { city: string };
  company: { name: string };
};

export type Photo = {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
};
