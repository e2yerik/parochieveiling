import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";

import Loader from "../../../components/Loading";
import { ProductData } from "../../../model/Product";
import GlobalMessage from "../../../components/GlobalMessage";
import { Message } from "../../../model/Message";

const ADMIN_BIDS_QUERY = gql`
  query adminBids {
    adminBids {
      product {
        code
        name
      }
      priceValue
      timeStamp
      bidder {
        email
      }
    }
  }
`;

export interface AdminBid {
  product: ProductData;
  timeStamp: number;
  priceValue: string;
  bidder: { email: string };
}

const formatTimeStamp = (ts: number) => new Date(ts).toLocaleString();

const adminBidsPage: React.FC = () => {
  const { data, loading, error } = useQuery(ADMIN_BIDS_QUERY);

  const [message, showMessage] = useState<Message>({
    message: "",
    type: "",
  });

  useEffect(() => {
    console.log("update data", { data });

    if (error) {
      console.error("failed loading bids", { error });

      showMessage({
        type: "bad",
        message: "Er is een fout opgetreden bij het laden van alle biedingen",
      });
    }
  }, [data, error]);

  return (
    <>
      <h1>Alle Biedingen</h1>

      {loading && <Loader />}
      {message?.message && <GlobalMessage message={message} />}

      <table className="table mb-xl">
        <thead>
          <th className="right">#</th>
          <th>Product</th>
          <th>Tijdstip</th>
          <th>Gebruikersnaam</th>
          <th>Bedrag</th>
        </thead>
        <tbody>
          {data?.adminBids?.map((bid: AdminBid, index: number) => (
            <tr key={`${bid.product.code}-${bid.priceValue}`}>
              <td className="right">
                <strong>{index + 1}.</strong>
              </td>
              <td>
                Product {bid.product.code} - {bid.product.name}
              </td>
              <td>{formatTimeStamp(bid.timeStamp)}</td>
              <td>{bid.bidder.email}</td>
              <td>{bid.priceValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default adminBidsPage;
