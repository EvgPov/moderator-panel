// Все адреса API собраны в одном месте.
// Компоненты не должны собирать URL вручную -- берите их отсюда.

export const API_URL = 'https://jsonplaceholder.typicode.com';

export const POSTS_PER_PAGE = 10;

type PostsParams = {
  page: number;
  query: string;
};

export const endpoints = {
  posts: ({ page, query }: PostsParams) => {
    const params = new URLSearchParams({
      _page: String(page),
      _limit: String(POSTS_PER_PAGE),
    });
    if (query.trim()) {
      params.set('q', query.trim());
    }
    return `${API_URL}/posts?${params.toString()}`;
  },
  post: (postId: string) => `${API_URL}/posts/${postId}`,
  postComments: (postId: string) => `${API_URL}/posts/${postId}/comments`,
  comments: `${API_URL}/comments`,
  users: `${API_URL}/users`,
  user: (userId: number) => `${API_URL}/users/${userId}`,
  photos: `${API_URL}/photos`,
};
