import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Register } from "./Register";
import * as api from "../apiFunctions/register";

describe("Register", () => {
  const setup = () =>
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

  it("validates input before calling the API", async () => {
    const spy = vi.spyOn(api, "register");
    setup();

    await userEvent.click(screen.getByRole("button", { name: "Zarejestruj się" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Podaj nazwę użytkownika i hasło.");

    await userEvent.type(screen.getByLabelText("Nazwa użytkownika"), "ania");
    await userEvent.type(screen.getByLabelText(/Hasło/), "123");
    await userEvent.click(screen.getByRole("button", { name: "Zarejestruj się" }));
    expect(screen.getByRole("alert")).toHaveTextContent("co najmniej 6 znaków");
    expect(spy).not.toHaveBeenCalled();
  });

  it("shows a friendly message when the username is taken", async () => {
    vi.spyOn(api, "register").mockRejectedValue(
      Object.assign(new Error("conflict"), { isAxiosError: true, response: { status: 409 } })
    );
    setup();

    await userEvent.type(screen.getByLabelText("Nazwa użytkownika"), "ania");
    await userEvent.type(screen.getByLabelText(/Hasło/), "haslo123");
    await userEvent.click(screen.getByRole("button", { name: "Zarejestruj się" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Nazwa użytkownika jest zajęta.");
  });
});
