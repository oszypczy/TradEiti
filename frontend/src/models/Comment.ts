export interface Comment {
  offer_id: number;
  username: string;
  text: string;
  date: string;
}

// Body of a new comment; the server fills in the author and date.
export interface NewComment {
  offer_id: number;
  text: string;
}
