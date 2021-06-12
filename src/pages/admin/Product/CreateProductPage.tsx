import React, {
  useState,
  ChangeEvent,
  FormEventHandler,
  useEffect,
} from "react";
import { gql, useMutation } from "@apollo/client";
import { useHistory } from "react-router";
import { FormEvent } from "react";
import { Message } from "../../../model/Message";
import GlobalMessage from "../../../components/GlobalMessage";

interface CreateProductData {
  code: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  thumbUrl: string;

  minPrice?: string;
  price?: string;

  step: string;
  parentProductCode: string;
}

export const initialState: CreateProductData = {
  name: "",
  code: "",
  shortDescription: "",
  longDescription: "",
  imageUrl: "",
  thumbUrl: "",
  step: "10",
  parentProductCode: "",
  minPrice: "",
  price: "",
};

const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $code: String!
    $shortDescription: String
    $longDescription: String
    $imageUrl: String!
    $thumbUrl: String!
    $formattedPrice: String
    $price: String
    $priceType: String
    $parentProductCode: String
    $step: Int
    $update: Boolean
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
      priceType: $priceType
      parentProductCode: $parentProductCode
      step: $step
      update: $update
    ) {
      code
    }
  }
`;

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(price);

const CreateProductPage = () => {
  const history = useHistory();
  const [formData, updateFormState] = useState(initialState);

  const [update, setUpdate] = useState(false);

  const [message, showMessage] = useState<Message>({
    message: "",
    type: "",
  });

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

    showMessage({ type: "", message: "" });

    const variables: any = {
      ...formData,
      update,
    };

    if (formData.price) {
      variables.priceType = "FIXED";
    } else if (formData.minPrice) {
      variables.price = formData.minPrice;
      variables.priceType = "MIN";
      delete variables["minPrice"];
    }

    variables.formattedPrice = formatPrice(variables.price);
    variables.step = parseInt(formData.step, 10);
    createProduct({
      variables,
    });

    updateFormState(initialState);

    setUpdate(false);
  };

  useEffect(() => {
    if (data?.createProduct?.code) {
      showMessage({
        type: "good",
        message: `Product ${data.createProduct.code} aangemaakt!`,
      });
    } else if (data?.createProduct?.message) {
      showMessage({
        type: "bad",
        message: `Fout opgetreden: ${data.createProduct.message}: ${data.createProduct.description}`,
      });
    }
  }, [data]);

  return (
    <div className="center-third">
      <h1>Product aanmaken</h1>

      {message?.message && <GlobalMessage message={message} />}

      <form onSubmit={onSubmit} className="form">
        {/* <label>
          Overschrijven:
          <input
            type="checkbox"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setUpdate(event.target.checked);
            }}
            name="update"
          ></input>
        </label> */}
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
          Hoofdprodukt code (optioneel):
          <input
            type="text"
            value={formData.parentProductCode}
            name="parentProductCode"
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
        {/* 
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
          Vaste prijs (optioneel)
          <input
            type="text"
            value={formData.price}
            name="price"
            onChange={handleInputChange}
          />
        </label> */}

        <label>
          Vanaf prijs (optioneel)
          <input
            type="text"
            value={formData.minPrice}
            name="minPrice"
            onChange={handleInputChange}
          />
        </label>

        <label>
          Stap prijs bod (optioneel)
          <input
            type="number"
            value={formData.step}
            name="step"
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
