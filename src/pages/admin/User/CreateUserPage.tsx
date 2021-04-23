import React, {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  FormEventHandler,
  Ref,
  useState,
} from "react";

import { gql, useMutation } from "@apollo/client";
import { Link, useHistory } from "react-router-dom";

export interface CreateUserProps {}

interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
}

const CREATE_USER = gql`
  mutation RegisterUser($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      message
      description
      name
    }
  }
`;

export const initialState: CreateUserFormData = {
  name: "",
  email: "",
  password: "",
};

const CreateUserPage: React.FC<CreateUserProps> = () => {
  const history = useHistory();
  const [createUser, { data }] = useMutation(CREATE_USER);
  const [formData, updateFormState] = useState<CreateUserFormData>(
    initialState
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateFormState((prevProps) => ({
      ...prevProps,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit: React.FormEventHandler = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    createUser({
      variables: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      },
    });

    updateFormState(initialState);

    return false;
  };

  return (
    <div className="center-third">
      <h1>Gebruiker aanmaken</h1>

      {data && data.register && data.register.name && (
        <strong>Gebruiker {data.register.name} aangemaakt</strong>
      )}

      {data && data.register && data.register.message && (
        <strong>
          Fout opgetreden: {data.register.message}: {data.register.description}
        </strong>
      )}

      <form onSubmit={onSubmit} className="form">
        <label>
          Naam:{" "}
          <input
            type="text"
            value={formData.name}
            name="name"
            onChange={handleInputChange}
          />
        </label>

        <label>
          Email adres:{" "}
          <input
            type="email"
            value={formData.email}
            name="email"
            onChange={handleInputChange}
          />
        </label>

        <label>
          Wachtwoord:{" "}
          <input
            type="password"
            value={formData.password}
            name="password"
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

export default CreateUserPage;
