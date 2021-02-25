import React, { useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ProductData } from "../model/Product";


type ProductRouteParams = {
    id: string;
}

type ProductPageProps = RouteComponentProps<ProductRouteParams>;

const ProductPage: React.FC<ProductPageProps> = (props: ProductPageProps) => {
    const [product, setProduct] = useState<ProductData> ();
    const id = props.match.params.id;
    useEffect(() => {
        const asyncCallback = async() => {
            const products: ProductData[] = await (await fetch('/api/products')).json();
            const product: ProductData | undefined = products.find((p: ProductData) => p.code === id);
            if (product) {
                setProduct(product);
            }
        };

        asyncCallback();
    }, [id]);

    return (
        <>
            {product && (
                <Col>
                    <h2>{product.code}</h2>
                </Col>
            )}
        </>
    );
};

export default withRouter(ProductPage);