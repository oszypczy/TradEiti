import { ReactElement } from "react";
import { useAuthContext } from "../../providers/authContext";

interface AuthorizedProps {
  isAuthorized: ReactElement;
  notAuthorized?: ReactElement;
}

// Renders `isAuthorized` only if user is connected to usos
export default function Authorized(props: AuthorizedProps) {
  const { connectedToUsos } = useAuthContext();
  return <>{connectedToUsos ? props.isAuthorized : props.notAuthorized}</>;
}
