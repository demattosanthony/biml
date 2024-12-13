export interface Comment {
  guid: string;
  date: string;
  author: string;
  comment: string;
  topic_guid: string;
  authorization?: {
    comment_actions: string[];
  };
}

export interface Topic {
  guid: string;
  server_assigned_id: string;
  creation_author: string;
  title: string;
  labels: string[];
  creation_date: string;
  topic_type?: string;
  topic_status: string;
  priority?: string;
  assigned_to?: string;
  description?: string;
  bim_snippet?: {
    snippet_type: string;
    is_external: boolean;
    reference: string;
    reference_schema: string;
  };
}
