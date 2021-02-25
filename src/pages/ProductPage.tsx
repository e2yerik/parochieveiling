import { useEffect, useState } from "react";


const ProductPage: React.FC = () => {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const asyncCallback = async() => {
            setProducts(await (await fetch('/api/products')).json());
        };

        asyncCallback();
    }, []);

    return (
        <h1>I am the product page</h1>
    );
};

export default ProductPage;