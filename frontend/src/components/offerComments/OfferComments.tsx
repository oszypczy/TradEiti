import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getOfferComments } from "../../apiFunctions/getOfferComments";
import { createOfferComment } from "../../apiFunctions/createOfferComment";
import { Comment } from "../../models/Comment";
import { useAuthContext } from "../../providers/authContext";
import { queryKeys } from "../../config/queryKeys";
import "./style.scss";

const MAX_COMMENT_LENGTH = 255;

interface Props {
  offerId: string;
}

function isForbidden(error: unknown) {
  return isAxiosError(error) && error.response?.status === 403;
}

export function OfferComments({ offerId }: Props) {
  const { currentUser } = useAuthContext();
  const queryClient = useQueryClient();
  const lastCommentRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState("");

  const { data: comments, error } = useQuery({
    queryKey: queryKeys.comments(offerId),
    queryFn: () => getOfferComments(offerId),
    retry: (failureCount, err) => !isForbidden(err) && failureCount < 3,
  });

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: (text: string) =>
      createOfferComment({ offer_id: Number(offerId), text }),
    onSuccess: () => {
      setNewComment("");
      return queryClient.invalidateQueries({
        queryKey: queryKeys.comments(offerId),
      });
    },
    onError: (err) => {
      alert(
        isForbidden(err)
          ? "Nie możesz komentować tej oferty."
          : "Nie udało się dodać komentarza."
      );
    },
  });

  useEffect(() => {
    lastCommentRef.current?.scrollIntoView();
  }, [comments]);

  if (isForbidden(error)) {
    return (
      <p className="noRequestsCom">
        Czat jest dostępny tylko dla uczestników tej wymiany.
      </p>
    );
  }

  const trimmed = newComment.trim();

  return (
    <>
      <div className="comments">
        {comments?.map((comment: Comment, index) => (
          <div
            key={index}
            ref={index === comments.length - 1 ? lastCommentRef : undefined}
            className={`commentItem ${
              currentUser?.username === comment.username
                ? "myComment"
                : "opponentComment"
            }`}
          >
            <div className="author">
              <h5>{comment.username}</h5>
            </div>
            <div className="content">
              <p>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="createComment">
        <textarea
          placeholder="Dodaj komentarz"
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
        ></textarea>
        <br />
        <p>
          Ilość znaków: <span>{newComment.length}</span>/{MAX_COMMENT_LENGTH}
        </p>
        <br />
        <button
          type="button"
          className="commentButton"
          onClick={() => addComment(trimmed)}
          disabled={
            isPending || !trimmed || newComment.length > MAX_COMMENT_LENGTH
          }
        >
          Dodaj komentarz
        </button>
      </div>
    </>
  );
}
