import React, {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  FormEventHandler,
  useEffect,
  useState,
} from "react";
import { RouteComponentProps, useHistory, withRouter } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { PriceData } from "../../model/Product";
import { formatPrice } from "../admin/Product/CreateProductPage";
import "./ProductPage.scss";

type ProductRouteParams = {
  id: string;
};

type ProductPageProps = RouteComponentProps<ProductRouteParams>;

const ProductPage: React.FC<ProductPageProps> = (props: ProductPageProps) => {
  const history = useHistory();
  const [bid, setBid] = useState<string>("");
  const [price, setPrice] = useState<PriceData>({
    value: 0,
    formattedValue: "",
    type: "FIXED",
  });

  const {
    match: {
      params: { id },
    },
  } = props;

  const { data } = useQuery(
    gql`
      query GetProduct($code: String!) {
        product(code: $code) {
          code
          name
          longDescription
          price {
            formattedValue
            value
            type
          }
          imageUrl
        }
      }
    `,
    { variables: { code: id } }
  );
  const onSubmit: FormEventHandler = (event: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
  };

  useEffect(() => {
    if (data?.product?.price) {
      setPrice(data.product.price);
    }
  }, [data?.product]);

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

  return (
    <>
      {data && data.product && (
        <section className="product__grid">
          <div className="product__grid-title">
            <h1 className="mb-s">{data.product.name}</h1>
            <p>Kavelnummer: {data.product.code}</p>
          </div>

          <img src={data.product.imageUrl} className="product__grid-image" />

          <div className="product__grid-buy">
            {data.product.longDescription && (
              <div>
                <strong className="underline__title mb-s">Omschrijving</strong>
                <div
                  dangerouslySetInnerHTML={{
                    __html: data.product.longDescription,
                  }}
                ></div>
              </div>
            )}

            {price?.type == "MIN" && (
              <div className="price__panel mb-xl">
                <strong>Bieden vanaf {price.formattedValue}</strong>

                <form onSubmit={onSubmit} className="form">
                  <label>
                    Bod verhogen met
                    <select value={bid} onChange={onChangeBid}>
                      <option value="-1">&euro;&euro;&euro;</option>
                      {[10, 20, 30, 40, 50].map((val) => (
                        <option key={val} value={price.value + val}>
                          + {val} &euro;
                        </option>
                      ))}
                    </select>
                  </label>

                  {bid && (
                    <strong>Jouw bod: {formatPrice(parseFloat(bid))}</strong>
                  )}
                  <footer>
                    <div></div>
                    <button type="submit" className="btn btn--primary">
                      Bod uitbrengen!
                    </button>
                  </footer>
                </form>
              </div>
            )}

            {price?.type == "FIXED" && (
              <form onSubmit={onSubmit} className="form">
                <label>
                  Vaste prijs
                  <input type="number" value={price.value} disabled={true} />
                </label>

                <footer>
                  <div></div>
                  <button type="submit" className="btn btn--primary">
                    Kopen!
                  </button>
                </footer>
              </form>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default withRouter(ProductPage);
