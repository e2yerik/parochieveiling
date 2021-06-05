import React, { useState } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import AddtoCartForm from "./components/AddToCartForm";
import GlobalMessage from "../../components/GlobalMessage";

import "./ProductPage.scss";
import { Message } from "../../model/Message";
import { ProductData } from "../../model/Product";

type ProductRouteParams = {
  id: string;
};

type ProductPageProps = RouteComponentProps<ProductRouteParams>;

const ProductPage: React.FC<ProductPageProps> = (props: ProductPageProps) => {
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
          relatedProducts {
            code
            price {
              formattedValue
              value
              type
            }
            step
          }
        }
      }
    `,
    { variables: { code: id } }
  );

  const [message, showMessage] = useState<Message>({
    message: "",
    type: "",
  });

  return (
    <>
      {data && data.product && (
        <>
          {message?.message && <GlobalMessage message={message} />}

          <section className="product__grid">
            <div className="product__grid-title">
              <h1 className="mb-s">{data.product.name}</h1>
              <p>Kavelnummer: {data.product.code}</p>
            </div>

            {data.product.imageUrl && (
              <img
                src={data.product.imageUrl}
                className="product__grid-image"
              />
            )}

            {data.product.longDescription && (
              <div className="product__grid-description mb-l">
                <strong className="underline__title mb-s">Omschrijving</strong>
                <div
                  dangerouslySetInnerHTML={{
                    __html: data.product.longDescription,
                  }}
                ></div>
              </div>
            )}

            <div className="product__grid-buy">
              {data.product.relatedProducts?.map((rp: ProductData) => (
                <div key={`addtocartform-${rp.code}`}>
                  <AddtoCartForm
                    product={rp}
                    onMessage={(message, type) =>
                      showMessage({ message, type })
                    }
                    beforeButtonText={rp.code}
                  />
                </div>
              ))}

              {!data.product.relatedProducts && (
                <AddtoCartForm
                  product={data.product}
                  onMessage={(message, type) => showMessage({ message, type })}
                />
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default withRouter(ProductPage);
