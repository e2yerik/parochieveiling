import { gql, useMutation, useQuery } from "@apollo/client";
import React, {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  FormEventHandler,
  useEffect,
  useState,
} from "react";
import { PriceData, ProductData } from "../../../model/Product";
import { formatPrice } from "../../admin/Product/CreateProductPage";

export interface AddToCartFormProps {
  product: ProductData;
  onMessage(message: string, type: string): void;
  beforeButtonText?: string;
}

const PLACE_BID = gql`
  mutation PlaceBid($code: String!, $bid: String!) {
    placeBid(code: $code, bid: $bid) {
      message
      description
      timeStamp
    }
  }
`;

const HIGHEST_BID = gql`
  query HighestBid($code: String) {
    productBid(code: $code) {
      value
      formattedValue
    }
  }
`;
const AddtoCartForm: React.FC<AddToCartFormProps> = (
  props: AddToCartFormProps
) => {
  const { product } = props;
  const [bid, setBid] = useState<string>("");
  const [price, setPrice] = useState<PriceData>({
    value: 0,
    formattedValue: "",
    type: "FIXED",
  });

  const [placeBid, { data: bidData }] = useMutation(PLACE_BID);

  const { data: highestBidData } = useQuery(HIGHEST_BID, {
    variables: { code: product.code },
  });
  const [currentBid, setCurrentBid] = useState({} as PriceData);

  const onSubmit: FormEventHandler = (event: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    placeBid({
      variables: {
        code: product.code,
        bid,
      },
    });
  };

  useEffect(() => {
    if (product?.price) {
      setPrice(product.price);
    }
  }, [product]);

  useEffect(() => {
    if (highestBidData?.productBid) {
      const price = highestBidData?.productBid;
      setCurrentBid(price);
    }
  }, [highestBidData?.productBid]);

  const onChangeBid: ChangeEventHandler = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.currentTarget.value;
    if (value !== "-1") {
      setBid(value);
    } else {
      setBid("");
    }
  };

  useEffect(() => {
    if (bidData?.placeBid?.timeStamp) {
      props.onMessage("Bedankt voor uw bod", "good");
    } else if (bidData?.placeBid?.message) {
      props.onMessage(
        `${bidData.placeBid.message} - ${bidData.placeBid.description}`,
        "bad"
      );
    }
  }, [bidData]);

  let currentPrice: number;
  if (currentBid?.value) {
    currentPrice = currentBid.value;
  } else {
    currentPrice = price.value;
  }

  const singleStep = product.step || 10;
  const steps = [0, 1, 2, 3, 4, 5].map((i: number) => singleStep * i);

  return (
    <>
      {price?.type == "MIN" && (
        <div className="price__panel mb-s">
          <strong className="mb-m">
            {!currentBid && <>Bieden vanaf {formatPrice(price.value)}</>}
            {currentBid?.value && (
              <p className="mb-s">
                Hoogste bod {formatPrice(currentBid.value)}
              </p>
            )}
          </strong>

          <form onSubmit={onSubmit} className="form">
            <label>
              Bod verhogen met
              <select value={bid} onChange={onChangeBid}>
                <option value="-1">&euro;&euro;&euro;</option>
                {steps.map((val) => (
                  <option key={val} value={currentPrice + val}>
                    + {val} &euro;
                  </option>
                ))}
              </select>
            </label>

            {bid && (
              <strong className="mb-m">
                Jouw bod: {formatPrice(parseFloat(bid))}
              </strong>
            )}
            <footer>
              <div>{props.beforeButtonText}</div>
              <button type="submit" className="btn btn--primary">
                Bod uitbrengen!
              </button>
            </footer>
          </form>
        </div>
      )}

      {price?.type == "FIXED" && (
        <div className="price__panel mb-xl">
          <form onSubmit={onSubmit} className="form">
            <label>
              Vaste prijs
              <input type="number" value={price.value} disabled={true} />
            </label>

            <footer>
              <div>{props.beforeButtonText}</div>
              <button type="submit" className="btn btn--primary">
                Kopen!
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* {bidData && bidData.placeBid.timeStamp && (
        <strong>Bedankt voor uw bod!</strong>
      )}
      {bidData && bidData.placeBid.message && (
        <>
          <h2>{bidData.placeBid.message}</h2>
          <p>{bidData.placeBid.description}</p>
        </>
      )} */}
    </>
  );
};

export default AddtoCartForm;
