import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Col, Row } from "react-bootstrap";
import { ProductData } from "../model/Product";
import {gql, useQuery } from '@apollo/client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBeer, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

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
    code, name, shortDescription
  }
    }
`;

const ProductListerPage: React.FC<ProductListProps> = ({page}) => {
    const {data, loading, error} = useQuery(GET_PRODUCTS);

    if (loading) {
        return <FontAwesomeIcon icon={faBeer} />
    } else  if (error) {
        return (
            <Row>
                <Col>
                    <h1><FontAwesomeIcon icon={faExclamationCircle} /> Fout opgetreden</h1>

                    <p>Er is een fout opgetreden bij het laden van de kavels, probeer opnieuw </p>
                    <p>Als het probleem vaker voorkomt, neem aub contact op met de <a href="mailto:pvlb@ziggo.nl">Parochie administratie</a>.</p>
                </Col>
            </Row>
        )
    }

    return (
        <>
            <Row>
                <Col><h1>Actieve kavels</h1></Col>
            </Row>

            <Row>
                {data && data.allProducts && data.allProducts.map((product: ProductData, index: number) =>(
                    <Col>
                        <Link to={`/p/${product.code}`} key={index}>
                            <Card style={{ width: '18rem' }}>
                                <Card.Body>
                                    <Card.Title>{product.name}</Card.Title>
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