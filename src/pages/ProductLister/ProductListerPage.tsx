import React from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBeer, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { ProductData } from '../../model/Product';
import "./ProductLister.scss";

export interface ProductListQueryData {
    products: [ProductData]
}
export interface ProductListQueryVars {
    page: Number
}

export interface ProductListProps {
    page: number
}

const GET_PRODUCTS = gql`
    query GetProductsForPage {  
      allProducts(active: true) {
        code, name, shortDescription, thumbUrl,
        price {
          formattedValue
        }
      }
    }
`;

const ProductListerPage: React.FC<ProductListProps> = () => {
  const { data, loading, error } = useQuery(GET_PRODUCTS);

  if (loading) {
    return <FontAwesomeIcon icon={faBeer} />;
  } if (error) {
    return (
      <>
        <h1>
          <FontAwesomeIcon icon={faExclamationCircle} />
          {' '}
          Fout opgetreden
        </h1>

        <p>Er is een fout opgetreden bij het laden van de kavels, probeer opnieuw </p>
        <p>
          Als het probleem vaker voorkomt, neem aub contact op met de
          <a href="mailto:pvlb@ziggo.nl">Parochie administratie</a>
          .
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Actieve kavels</h1>

      <ul className="product__list">
        {data && data.allProducts && data.allProducts.map((product: ProductData) => (
          <li key={product.code}>
            <Link to={`/kavel/${product.code}`} className="product__list-tile">
              <div className="product__tile">
                {product.thumbUrl && <img src={product.thumbUrl} height="240" />}
                
                <strong className="product__tile-name">{product.name}</strong>
                <p className="product__tile-description">{product.shortDescription}</p>

                {product.price && <span>{product.price.formattedValue}</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul> 
    </>
  );
};

export default ProductListerPage;
