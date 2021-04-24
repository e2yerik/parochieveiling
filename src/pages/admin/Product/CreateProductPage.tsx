import React, { useState, ChangeEvent, FormEventHandler } from "react";
import { gql, useMutation } from "@apollo/client";
import { useHistory } from "react-router";
import { ProductData } from "../../../model/Product";
import { FormEvent } from "react";

interface CreateProductData {
  code: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  thumbUrl: string;
  price: number;
  formattedPrice: string;
}
export const initialState: CreateProductData = {
  name: "",
  code: "",
  shortDescription: "",
  longDescription: "",
  imageUrl: "",
  thumbUrl: "",
  price: 0,
  formattedPrice: "",
};

const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $code: String!
    $shortDescription: String!
    $longDescription: String!
    $imageUrl: String!
    $thumbUrl: String!
    $formattedPrice: String!
    $price: String!
  ) {
    createProduct(
      name: $name
      code: $code
      shortDescription: $shortDescription
      longDescription: $longDescription
      imageUrl: $imageUrl
      thumbUrl: $thumbUrl
      formattedPrice: $formattedPrice
      price: $price
    ) {
      code
    }
  }
`;

const CreateProductPage = () => {
  const history = useHistory();
  const [formData, updateFormState] = useState(initialState);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateFormState((prevProps) => ({
      ...prevProps,
      [event.target.name]: event.target.value,
    }));
  };

  const [createProduct, { data }] = useMutation(CREATE_PRODUCT);

  const onSubmit: FormEventHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // formData.price =
    formData.formattedPrice = new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(formData.price);

    createProduct({ variables: { ...formData } });
    updateFormState(initialState);
  };

  return (
    <div className="center-third">
      <h1>Product aanmaken</h1>

      {data && data.createProduct && data.createProduct.code && (
        <strong>Product {data.createProduct.code} aangemaakt!</strong>
      )}

      {data && data.createProduct && data.createProduct.message && (
        <strong>
          Fout opgetreden: {data.createProduct.message}:{" "}
          {data.createProduct.description}
        </strong>
      )}

      <form onSubmit={onSubmit} className="form">
        <label>
          Code:
          <input
            type="text"
            value={formData.code}
            name="code"
            onChange={handleInputChange}
          />
        </label>
        <label>
          Naam:
          <input
            type="text"
            value={formData.name}
            name="name"
            onChange={handleInputChange}
          />
        </label>

        <label>
          Korte omschrijving
          <input
            type="text"
            value={formData.shortDescription}
            name="shortDescription"
            onChange={handleInputChange}
          />
        </label>

        <label>
          Volledige omschrijving
          <textarea
            rows={5}
            value={formData.longDescription}
            name="longDescription"
            onChange={handleInputChange}
          />
        </label>

        <label>
          URL grote afbeelding
          <input
            type="text"
            value={formData.imageUrl}
            name="imageUrl"
            onChange={handleInputChange}
          />
        </label>

        <label>
          URL kleine afbeelding
          <input
            type="text"
            value={formData.thumbUrl}
            name="thumbUrl"
            onChange={handleInputChange}
          />
        </label>
        <label>
          Vanaf prijs (optioneel)
          <input
            type="text"
            value={formData.price}
            name="price"
            onChange={handleInputChange}
          />
        </label>

        <footer>
          <a onClick={history.goBack} className="btn btn--secondary">
            Terug
          </a>
          <button type="submit" className="btn btn--primary">
            Registreren
          </button>
        </footer>
      </form>
    </div>
  );
};
export default CreateProductPage;
