import React, { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, Ref, useState } from 'react';

import { gql,useMutation } from '@apollo/client';

export interface CreateUserProps {
    
}

interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
}

const CREATE_USER = gql`
    mutation RegisterUser($name: String!, $email: String!, $password: String!) {
      register(name: $name, email: $email, password: $password) { 
        message, description, email
      }
    }
`;

export const initialState: CreateUserFormData =  {
  name: '',
  email: '',
  password: ''
};

const CreateUserPage: React.FC<CreateUserProps> = () => {
  const [createUser, {data}] = useMutation(CREATE_USER);
  const [formData, updateFormState] = useState<CreateUserFormData> (initialState)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateFormState((prevProps) => ({
      ...prevProps,
      [event.target.name]: event.target.value
    }));
  };

  const onSubmit: React.FormEventHandler = (event: FormEvent<HTMLFormElement>) =>{
    event.preventDefault();

    createUser({
      variables: {
        name: formData.name, 
        email: formData.email, 
        password: formData.password
      }
    });

    updateFormState(initialState);

    return false;
  };


  return (
    <>
      <h1>Gebruiker aanmaken</h1>

      {data && data.register && data.register.email && 
        <strong>
          Gebruiker {data.register.email} aangemaakt
        </strong>
        }

       {data && data.register && data.register.message &&
        <strong>Fout opgetreden: {data.register.message}: {data.register.description}</strong>
       } 

      <form onSubmit={onSubmit}>
        <label>
          Naam: <input type="text" value={formData.name} name="name" onChange={handleInputChange} />
        </label>

        <label>
          Email adres: <input type="email" value={formData.email} name="email" onChange={handleInputChange}  />
        </label>

        <label>
          Wachtwoord: <input type="password" value={formData.password} name="password" onChange={handleInputChange}  />
        </label>
        <button type="submit">Gebruiker aanmaken</button>
      </form>
    </>
  );
};

export default CreateUserPage;
