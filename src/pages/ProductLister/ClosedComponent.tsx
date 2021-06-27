import React from "react";
import "./ProductLister.scss";

const ClosedComponent: React.FC<any> = () => {
  return (
    <>
      <h1>Veiling Gesloten</h1>

      <p>Bieden is niet meer mogelijk.</p>
      <p>Je krijgt binnenkort een mailtje van het bestuur.</p>
    </>
  );
};

export default ClosedComponent;
