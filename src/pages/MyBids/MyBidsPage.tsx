import React from "react";
import { gql, useQuery } from "@apollo/client";

import Loader from "../../components/Loading";
import { ProductData } from "../../model/Product";

const MY_BIDS_QUERY = gql`
  query myBids {
    myBids {
      product {
        code
        name
      }
    }
    # priceValue
  }
`;

export interface MyBid {
  product: ProductData;
  ts: number;
  priceValue: number;
}

const MyBidsPage: React.FC = () => {
  const { data, loading, error } = useQuery(MY_BIDS_QUERY);
  return (
    <>
      <h1>Mijn Biedingen</h1>

      {loading && <Loader />}
      {error && error}

      <table>
        <thead>
          <th>Product</th>
          <th>Tijdstip</th>
          <th>Bedrag</th>
        </thead>
        <tbody>
          {data &&
            data.myBids.map((bid: MyBid) => (
              <td key={bid.ts}>
                <tr>
                  Product {bid.product.code} - {bid.product.name}
                </tr>
                <tr>{bid.ts}</tr>
                <tr>{bid.priceValue}</tr>
              </td>
            ))}
        </tbody>
      </table>
    </>
  );
};

export default MyBidsPage;
