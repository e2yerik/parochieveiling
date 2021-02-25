import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Col, Row } from "react-bootstrap";
import { ProductData } from "../model/Product";


const ProductListerPage: React.FC = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const asyncCallback = async() => {
            setProducts(await (await fetch('/api/products')).json());
        };

        asyncCallback();
    }, []);

    return (
        <>
            <Row>
                <Col><h1>I am the lister page</h1></Col>
            </Row>

            <Row>
                {products && products.map((product: ProductData, index: number) =>(
                    <Col>
                        <Link to={`/p/${product.code}`} key={index}>
                            <Card style={{ width: '18rem' }}>
                                <Card.Body>
                                    <Card.Title>{product.code}</Card.Title>
                                    <Button variant="primary">View info</Button>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
        </>
    );
}


export default ProductListerPage;