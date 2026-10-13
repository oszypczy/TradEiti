import { useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { requestOffer } from "../../apiFunctions/requestOffer";
import { Button } from "../../common/button/Button";
import { OfferDto } from "../../models/Offer";
import { GroupDto } from "../../models/GroupDto";
import { queryKeys } from "../../config/queryKeys";
import "./style.scss";
import { useAuthContext } from "../../providers/authContext";

interface Props {
  offer: OfferDto;
}

function GroupDetails({ group }: { group: GroupDto }) {
  return (
    <>
      <p>
        {group.weekday}, {group.start_time}-{group.end_time},{" "}
        {group.class_type_name}, {group.group_number}
      </p>
      <p>
        Prowadzący: <b>{group.lecturers.join(", ")}</b>
      </p>
    </>
  );
}

export function OfferComponent({ offer }: Props) {
  const { currentUser } = useAuthContext();
  const queryClient = useQueryClient();
  const location = useLocation();
  const isOwnOffer = offer.owner_username === currentUser?.username;

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: () => requestOffer(offer.offer_id),
    onSuccess: () => alert("Prośba o akceptację oferty wysłana"),
    onError: (error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 403) {
        alert("Nie jesteś w grupie, której szuka wystawiający.");
      } else if (status === 409) {
        alert("Oferta nie jest już dostępna.");
      } else {
        alert("Coś poszło nie tak");
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.offers }),
  });

  return (
    <div
      className="offer"
      style={{
        backgroundColor: isOwnOffer
          ? `var(--my-course-color)`
          : `var(--course-color)`,
      }}
    >
      <div className="offer-left">
        <p>
          ID: {"\t"}
          <b>{offer.my_course.course_id}</b>
        </p>
        <p>
          Wystawiający: {"\t"}
          <b>{offer.owner_username}</b>
        </p>
        <p>
          Przedmiot: <b>{offer.my_course.course_name}</b>
        </p>
        <hr />
        <p>
          <b>Oddaję:</b>
        </p>
        <GroupDetails group={offer.my_course.groups[0]} />
        <hr />
        <p>
          <b>Chcę:</b>
        </p>
        <GroupDetails group={offer.wanted_course.groups[0]} />
      </div>
      <div className="offer-right">
        {!isOwnOffer && location.pathname === "/fittingOffers" && (
          <Button
            className="acceptButton"
            onClick={() => sendRequest()}
            disabled={isPending}
          >
            Akceptuj
          </Button>
        )}
      </div>
    </div>
  );
}
