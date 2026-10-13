import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../../common/button/Button";
import { ElementsContainer } from "../elementsContainer/ElementsContainer";
import { SearchOfferOptions } from "../../models/SearchOfferOptions";
import "./style.scss";

interface Props {
  inputsLabels: { label: string; input: keyof SearchOfferOptions; values: string[] }[];
  handleOnSubmit: (values: SearchOfferOptions) => void;
  handleOnReset: () => void;
  handleOnSort: (newestFirst: boolean) => void;
}

export function SearchTable({
  inputsLabels,
  handleOnSubmit,
  handleOnReset,
  handleOnSort,
}: Props) {
  const { register, handleSubmit, reset } = useForm<SearchOfferOptions>();

  const onSubmit: SubmitHandler<SearchOfferOptions> = (values) => {
    return handleOnSubmit(values);
  };

  const handleReset = () => {
    handleOnReset();
    reset();
  };

  return (
    <form className="searchTable" onSubmit={handleSubmit(onSubmit)}>
      <ElementsContainer>
        <div className="searchTable-header bold">Filtry</div>
        <div className="searchTable-body">
          {inputsLabels.map((value) => (
            <div key={value.input}>
              <label>
                <b>{value.label}:</b>
              </label>
              <select {...register(value.input)}>
                {value.values.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="searchTable-footer">
          <Button
            className="filterButton"
            type="button"
            onClick={() => handleOnSort(true)}
          >
            Od najnowszych
          </Button>
          <Button
            className="filterButton"
            type="button"
            onClick={() => handleOnSort(false)}
          >
            Od najstarszych
          </Button>
          <Button className="filterButton" type="reset" onClick={handleReset}>
            Resetuj
          </Button>
          <Button className="filterButton" type="submit">
            Filtruj
          </Button>
        </div>
      </ElementsContainer>
    </form>
  );
}
