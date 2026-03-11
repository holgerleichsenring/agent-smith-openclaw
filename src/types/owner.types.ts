export interface Owner {
  id: string;
  github_handle: string;
  github_avatar: string | null;
  created_at: Date;
}

export interface CreateOwnerInput {
  github_handle: string;
  github_avatar?: string;
}
