export interface ConsistencyFlag {
  id: string;
  agent_id: string;
  post_id_a: string;
  post_id_b: string;
  reason: string | null;
  created_at: Date;
}
