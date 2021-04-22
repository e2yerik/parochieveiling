import React, { MouseEventHandler } from "react";

import { Link } from "react-router-dom";
import { faUserLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AccountLink = () => {
  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    console.log({
      token,
      res: token !== process.env.REACT_APP_BOOTSTRAP_FAUNADB_KEY,
    });
    return token && token !== process.env.REACT_APP_BOOTSTRAP_FAUNADB_KEY;
  };

  const handleLogout: MouseEventHandler<HTMLAnchorElement> = (_) => {
    localStorage.removeItem("token");
  };

  if (!isLoggedIn()) {
    return (
      <Link
        to="/login"
        title="Inloggen"
        className="page__nav-link page__nav-link--right page__nav--icon"
      >
        Inloggen <FontAwesomeIcon icon={faUserLock} />
      </Link>
    );
  } else
    return (
      <a
        onClick={(e) => handleLogout(e)}
        title="Uitloggen"
        className="page__nav-link page__nav-link--right page__nav--icon"
      >
        Uitloggen
      </a>
    );
};
export default AccountLink;
