export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  karma: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  url?: string;
  image_url?: string;
  post_type: 'text' | 'link' | 'image';
  author_id: string;
  community: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_moderated: boolean;
  moderation_reason?: string;
  // Relations
  author?: Profile;
  user_vote?: Vote;
}

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_id?: string;
  upvotes: number;
  downvotes: number;
  depth: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_moderated: boolean;
  moderation_reason?: string;
  // Relations
  author?: Profile;
  user_vote?: Vote;
  replies?: Comment[];
}

export interface Vote {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  vote_type: -1 | 1; // -1 for downvote, 1 for upvote
  created_at: string;
}

export interface CreatePostData {
  title: string;
  content?: string;
  url?: string;
  image_url?: string;
  post_type: 'text' | 'link' | 'image';
  community: string;
}

export interface CreateCommentData {
  content: string;
  post_id: string;
  parent_id?: string;
}