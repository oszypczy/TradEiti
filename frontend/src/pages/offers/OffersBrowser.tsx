import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { OffersList } from "../../components/offer/OffersList";
import { SearchTable } from "../../components/searchTable/SearchTable";
import { OfferDto } from "../../models/Offer";
import { SearchOfferOptions } from "../../models/SearchOfferOptions";
import { filterOffers } from "./filterOffers";
import {
  extractDatesFromOffers,
  extractLecturersFromOffers,
  extractSimpleValuesFromOffers,
} from "./extractValuesFromOffers";
import "./style.scss";

interface Props {
  queryKey: readonly unknown[];
  queryFn: () => Promise<OfferDto[]>;
}

const tabs = [
  { path: "/offers", title: "WSZYSTKIE OFERTY" },
  { path: "/fittingOffers", title: "OFERTY DLA MNIE" },
];

// Shared layout of the "all offers" and "offers for me" pages:
// tab switcher, filters and the offers list.
export function OffersBrowser({ queryKey, queryFn }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: allOffers } = useQuery({ queryKey, queryFn });
  const [searchValues, setSearchValues] = useState<SearchOfferOptions>();
  const [newestFirst, setNewestFirst] = useState(false);

  const offers = allOffers ?? [];
  const searchTableInputsLabels: {
    label: string;
    input: keyof SearchOfferOptions;
    values: string[];
  }[] = [
    {
      label: "ID",
      input: "course_id",
      values: extractSimpleValuesFromOffers("course_id", offers),
    },
    {
      label: "Zajęcia",
      input: "course_name",
      values: extractSimpleValuesFromOffers("course_name", offers),
    },
    {
      label: "Prowadzący",
      input: "lecturer",
      values: extractLecturersFromOffers(offers),
    },
    {
      label: "Termin",
      input: "date",
      values: extractDatesFromOffers(offers),
    },
  ];

  const offersToShow = useMemo(() => {
    if (!allOffers) return undefined;
    const filtered = searchValues
      ? filterOffers(searchValues, allOffers)
      : allOffers;
    const direction = newestFirst ? -1 : 1;
    return [...filtered].sort(
      (a, b) => direction * (Number(a.offer_id) - Number(b.offer_id))
    );
  }, [allOffers, searchValues, newestFirst]);

  return (
    <>
      <div className="offersPot">
        {tabs.map((tab) => (
          <div
            key={tab.path}
            className="pot"
            style={location.pathname === tab.path ? { opacity: 0.7 } : {}}
            onClick={() => navigate(tab.path)}
          >
            {tab.title}
          </div>
        ))}
      </div>
      <div className="offers">
        <SearchTable
          inputsLabels={searchTableInputsLabels}
          handleOnSubmit={setSearchValues}
          handleOnReset={() => setSearchValues(undefined)}
          handleOnSort={setNewestFirst}
        />
        <OffersList offers={offersToShow} />
      </div>
    </>
  );
}
