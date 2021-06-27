import React from "react";
import { Link } from "react-router-dom";

const AdminPage = () => {
  return (
    <>
      <h1>Beheer</h1>

      <ul>
        <li>
          <Link to="/admin/user/create">Gebruiker registreren</Link>
        </li>
        <li>
          <Link to="/admin/product/create">Product aanmaken</Link>
        </li>
        <li>
          <Link to="/admin/kavels">Kavels</Link>
        </li>
        <li>
          <Link to="/admin/bids">Biedingen</Link>
        </li>
      </ul>
    </>
  );
};
export default AdminPage;
