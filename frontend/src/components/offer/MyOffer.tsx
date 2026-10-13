import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectOffer } from "../../apiFunctions/rejectOffer";
import { removeOffer } from "../../apiFunctions/deleteOffer";
import { acceptOffer } from "../../apiFunctions/acceptOffer";
import { OfferDto } from "../../models/Offer";
import { OfferStatus } from "../../models/enums/OfferStatus";
import { queryKeys } from "../../config/queryKeys";
import { GroupDto } from "../../models/GroupDto";
import "./style.scss";

interface Props {
  offer: OfferDto;
}

function GroupSummary({ group }: { group: GroupDto }) {
  return (
    <>
      <span>
        {group.weekday} {group.start_time}-{group.end_time},{" "}
        {group.class_type_name}, Grupa {group.group_number}
      </span>
      <div className="offer-left-lecturers">
        {group.lecturers.map((lecturer, index) => (
          <span key={index}>{lecturer}</span>
        ))}
      </div>
    </>
  );
}

export function MyOfferComponent({ offer }: Props) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.offers }),
    onError: (error) => {
      console.error(error);
      alert("Nie udało się wykonać operacji. Odśwież stronę i spróbuj ponownie.");
      queryClient.invalidateQueries({ queryKey: queryKeys.offers });
    },
  });

  const handleApproveOffer = () =>
    mutate(() => acceptOffer(offer.offer_id, offer.state));
  const handleRemoveOffer = () => mutate(() => removeOffer(offer.offer_id));
  const handleRejectOffer = () => mutate(() => rejectOffer(offer.offer_id));

  return (
    <div className="offer">
      <div className="offer-left">
        <h6>{offer.my_course.course_id}</h6>
        <h6>{offer.my_course.course_name}</h6>
        <hr />
        <span>
          <b>Oddajesz: </b>
        </span>
        <GroupSummary group={offer.my_course.groups[0]} />
        <hr />
        <span>
          <b>Chcesz: </b>
        </span>
        <GroupSummary group={offer.wanted_course.groups[0]} />
      </div>
      <div className="offer-right">
        <p>
          <b>
            Status:{" "}
            {offer.state === OfferStatus.REQUEST_SENT
              ? "Prośba wysłana ✔️"
              : offer.state === OfferStatus.PENDING
                ? "Oczekuje ⏰"
                : offer.state}
          </b>
        </p>
        <button
          className="approveButton"
          onClick={handleApproveOffer}
          disabled={isPending || offer.state !== OfferStatus.REQUEST_SENT}
        >
          Zatwierdź ofertę
        </button>
        {offer.state === OfferStatus.REQUEST_SENT && (
          <button
            className="approveButton"
            onClick={handleRejectOffer}
            disabled={isPending}
          >
            Odrzuć ofertę
          </button>
        )}
        {offer.state === OfferStatus.PENDING && (
          <button
            className="approveButton"
            onClick={handleRemoveOffer}
            disabled={isPending}
          >
            Wycofaj ofertę
          </button>
        )}
      </div>
    </div>
  );
}
