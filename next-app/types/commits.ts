export interface Commit {
  id: string;
  message: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  hash: string;
  verified: boolean;
  pullRequest?: {
    number: number;
    branch: string;
  };
  status?: string;
}
