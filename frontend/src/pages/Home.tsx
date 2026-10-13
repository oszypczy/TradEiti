import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../providers/authContext";
import "./home.scss";

const RULES = [
  "Każdy może wystawić swoją ofertę lub przeglądać aktualnie dostępne.",
  "Wymiana jest możliwa tylko w ramach jednego przedmiotu.",
  "Wymieniać można tylko laboratoria i ćwiczenia — wykładów nie.",
  "Wymiany są 1 do 1: jedna godzina zajęć za inną.",
  "Gdy ktoś zaakceptuje Twoją ofertę, musisz ją zatwierdzić lub odrzucić.",
  "Ofertę, której nikt nie zaakceptował, możesz wycofać.",
];

const AUTHORS = ["Oliwier Szypczyn", "Kacper Multan", "Artur Kempiński", "Jakub Kryczka"];

export function Home() {
  const navigate = useNavigate();
  const { authenticated, connectedToUsos } = useAuthContext();

  return (
    <div className="home">
      <section className="home-hero">
        <div>
          <span className="kicker">Dla studentów Politechniki Warszawskiej</span>
          <h1 className="display">Wymieniaj godziny zajęć jeden do jednego.</h1>
          <p>
            TradeEITI pobiera Twój plan z USOS, pokazuje oferty innych studentów z tego samego przedmiotu i pozwala
            zamienić się grupą ćwiczeniową lub laboratoryjną.
          </p>
          <div className="actions">
            {!authenticated && (
              <>
                <button type="button" className="btn primary lg" onClick={() => navigate("/register")}>
                  Załóż konto
                </button>
                <button type="button" className="btn secondary lg" onClick={() => navigate("/login")}>
                  Mam już konto
                </button>
              </>
            )}
            {authenticated && connectedToUsos === false && (
              <button type="button" className="btn primary lg" onClick={() => navigate("/usos-connect")}>
                Połącz z USOS
              </button>
            )}
            {authenticated && connectedToUsos && (
              <>
                <button type="button" className="btn primary lg" onClick={() => navigate("/offers")}>
                  Przeglądaj oferty
                </button>
                <button type="button" className="btn secondary lg" onClick={() => navigate("/myOffers/new")}>
                  Dodaj ofertę
                </button>
              </>
            )}
          </div>
        </div>
        <div className="home-art">
          <img src="/TradeEITI.png" alt="TradeEITI" />
        </div>
      </section>

      <section className="stack" style={{ gap: 20 }}>
        <h2 className="section-title">Jak to działa?</h2>
        <div className="home-steps">
          <div className="card">
            <span className="num">01</span>
            <h3>Połącz konto z USOS</h3>
            <p>Przez API USOS pobieramy Twoje przedmioty i aktualne grupy — oraz wszystkie inne dostępne terminy.</p>
          </div>
          <div className="card">
            <span className="num">02</span>
            <h3>Wystaw lub znajdź ofertę</h3>
            <p>
              Wskaż godzinę, którą oddajesz, i tę, którą chcesz. Albo wyślij prośbę do kogoś, kto szuka Twojej grupy.
            </p>
          </div>
          <div className="card">
            <span className="num green">03</span>
            <h3>Zatwierdź wymianę</h3>
            <p>
              Wystawiający potwierdza prośbę. Wymiana trafia do zakończonych, a Wy możecie ustalić szczegóły na czacie.
            </p>
          </div>
        </div>
      </section>

      <section className="home-info">
        <div className="card home-rules">
          <h2>Zasady wymian</h2>
          <ol>
            {RULES.map((rule, i) => (
              <li key={rule}>
                <span className="n">{i + 1}</span>
                <span>{rule}</span>
              </li>
            ))}
            <li className="final">
              <span className="n">{RULES.length + 1}</span>
              <span>Zatwierdzonej wymiany nie można cofnąć.</span>
            </li>
          </ol>
        </div>
        <div className="stack" style={{ gap: 20 }}>
          <div className="home-security">
            <h2>Czy to bezpieczne?</h2>
            <p>
              Tak. Nie zapisujemy danych logowania do USOS — tylko dane konta TradeEITI, z zaszyfrowanym hasłem.
              Aplikacja nie może zmieniać niczego w USOS; jedynie odczytuje dane udostępnione przez API.
            </p>
          </div>
          <div className="card home-authors">
            <span className="eyebrow" style={{ fontSize: 12 }}>
              Autorzy
            </span>
            <div>
              {AUTHORS.map((author) => (
                <span key={author} className="person">
                  {author}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
