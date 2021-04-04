import React from 'react';
import { Col } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';

type ProductRouteParams = {
    id: string;
}

type ProductPageProps = RouteComponentProps<ProductRouteParams>;

const ProductPage: React.FC<ProductPageProps> = (props: ProductPageProps) => {
  const { match: { params: { id } } } = props;

  const { data } = useQuery(gql`
        query GetProduct($code: String!) {
            product(code: $code) {
                code, name, longDescription
            }
        }
    `, { variables: { code: id } });

  return (
    <>
      {data && data.product && (
        <Col>
          <h1>{data.product.name}</h1>
          <h2>{data.product.code}</h2>
          <p>{data.product.longDescription}</p>
        </Col>
      )}
    </>
  );
};

export default withRouter(ProductPage);
