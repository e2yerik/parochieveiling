import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";

import Loader from "../../components/Loading";
import { ProductData } from "../../model/Product";
import { formatPrice } from "../admin/Product/CreateProductPage";
import GlobalMessage from "../../components/GlobalMessage";
import { Message } from "../../model/Message";

const MY_BIDS_QUERY = gql`
  query myBids {
    myBids {
      product {
        code
        name
      }
      priceValue
      timeStamp
    }
  }
`;

export interface MyBid {
  product: ProductData;
  timeStamp: number;
  priceValue: string;
}

const formatTimeStamp = (ts: number) => new Date(ts).toLocaleString();

const MyBidsPage: React.FC = () => {
  const { data, loading, error } = useQuery(MY_BIDS_QUERY);

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
        message: "Er is een fout opgetreden bij het laden van je biedingen",
      });
    }
  }, [data, error]);

  return (
    <>
      <h1>Mijn Biedingen</h1>

      {loading && <Loader />}
      {message?.message && <GlobalMessage message={message} />}

      <table className="table mb-xl">
        <thead>
          <th className="right">#</th>
          <th>Product</th>
          <th>Tijdstip</th>
          <th>Bedrag</th>
        </thead>
        <tbody>
          {data?.myBids
            ?.filter((bid: MyBid) => !isNaN(parseFloat(bid.priceValue)))
            .map((bid: MyBid, index: number) => (
              <tr key={`${bid.product.code}-${bid.priceValue}`}>
                <td className="right">
                  <strong>{index + 1}.</strong>
                </td>
                <td>
                  Product {bid.product.code} - {bid.product.name}
                </td>
                <td>{formatTimeStamp(bid.timeStamp)}</td>
                <td>{formatPrice(parseFloat(bid.priceValue))}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

export default MyBidsPage;
