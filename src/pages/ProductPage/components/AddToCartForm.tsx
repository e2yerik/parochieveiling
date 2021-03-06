import { gql, useMutation, useQuery } from "@apollo/client";
import React, {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  FormEventHandler,
  useEffect,
  useState,
} from "react";
import GlobalMessage from "../../../components/GlobalMessage";
import { Message } from "../../../model/Message";
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
  const [bidAccepted, setBidAccepted] = useState(false);

  const [placeBid, { data: bidData, loading: loadingPlaceBid }] =
    useMutation(PLACE_BID);

  const { data: highestBidData, refetch } = useQuery(HIGHEST_BID, {
    variables: { code: product.code },
  });
  const [currentBid, setCurrentBid] = useState({} as PriceData);

  const [inlineMessage, showInlineMessage] = useState<Message>({
    message: "",
    type: "",
  });

  const onSubmit: FormEventHandler = (event: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    // props.onMessage("", "");
    showInlineMessage({
      message: "",
      type: "",
    });

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
      // props.onMessage("Bedankt voor uw bod", "good");
      showInlineMessage({
        message: "Bedankt voor uw bod!",
        type: "good",
      });
      refetch();
      setBidAccepted(true);
      setBid("");
    } else if (bidData?.placeBid?.message) {
      // props.onMessage(
      //   `${bidData.placeBid.message} - ${bidData.placeBid.description}`,
      //   "bad"
      // );
      showInlineMessage({
        message: `${bidData.placeBid.message} - ${bidData.placeBid.description}`,
        type: "bad",
      });
      setBid("");
    }
  }, [bidData]);

  let currentPrice: number;
  if (currentBid?.value) {
    currentPrice = currentBid.value;
  } else {
    currentPrice = price.value;
  }

  const singleStep = product.step || 10;
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
    (i: number) => singleStep * i
  );

  const placeFixedBid = (event: any) => {
    event.preventDefault();
    if (price?.type === "FIXED") {
      // props.onMessage("", "");
      showInlineMessage({
        message: "",
        type: "",
      });

      placeBid({
        variables: {
          code: product.code,
          bid: price.value.toString(),
        },
      });
      setBidAccepted(false);
    }
    return false;
  };

  return (
    <>
      {inlineMessage?.message && <GlobalMessage message={inlineMessage} />}

      {price?.type == "MIN" && (
        <div className="price__panel mb-s {bidAccepted && 'price__panel--highlight'}">
          <strong className="block mb-s">
            {props.beforeButtonText && <>Kavel {props.beforeButtonText} </>}
            {!currentBid?.value && (
              <>bieden vanaf {formatPrice(currentPrice)} </>
            )}
            {currentBid?.value > 0 && (
              <>hoogste bod {formatPrice(currentBid.value)} </>
            )}
            {bid && (
              <b style={{ color: "#7de8b2" }}>
                Jouw bod wordt dan: {formatPrice(parseFloat(bid))}
              </b>
            )}
          </strong>

          <form onSubmit={onSubmit} className="form">
            <label>
              Bod verhogen met
              <select value={bid} onChange={onChangeBid}>
                <option value="-1">&euro;&euro;&euro;</option>
                <option value={currentPrice + 5}>+ 5 &euro;</option>
                {steps.map((val) => (
                  <option key={val} value={currentPrice + val}>
                    + {val} &euro;
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={bid == "" || loadingPlaceBid}
              >
                Bod uitbrengen!
              </button>
            </label>
          </form>
        </div>
      )}

      {price?.type == "FIXED" && (
        <div className="price__panel mb-xl">
          <form onSubmit={placeFixedBid} className="form">
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
    </>
  );
};

export default AddtoCartForm;
