import React, { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, Ref, useState } from 'react';

import '../../styles/form.scss';

import { gql,useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';

export interface CreateUserProps {
    
}

interface LoginFormData {
  email: string;
  password: string;
}

const LOGIN_USER = gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) { 
        message, description, secret
      }
    }
`;

export const initialState: LoginFormData =  {
  email: '',
  password: ''
};

const LoginPage: React.FC<CreateUserProps> = () => {
  const [login, {data}] = useMutation(LOGIN_USER);
  const [formData, updateFormState] = useState<LoginFormData> (initialState)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateFormState((prevProps) => ({
      ...prevProps,
      [event.target.name]: event.target.value
    }));
  };

  const onSubmit: React.FormEventHandler = (event: FormEvent<HTMLFormElement>) =>{
    event.preventDefault();

    login({
      variables: {
        email: formData.email, 
        password: formData.password
      }
    });

    return false;
  };

  if (data && data.login && data.login.secret) {
    localStorage.setItem('token', data.login.secret);
    return (
      <strong>
        Ingelogd!! 
      </strong>
    );
  }

  return (
    <div className="center-third">
      <h1>Inloggen</h1>

       {data && data.login && data.login.message &&
        <strong>Fout opgetreden: {data.login.message}: {data.login.description}</strong>
       } 

      <form onSubmit={onSubmit} className="form">
        <label>
          Email adres: <input type="email" value={formData.email} name="email" onChange={handleInputChange}  />
        </label>

        <label>
          Wachtwoord: <input type="password" value={formData.password} name="password" onChange={handleInputChange}  />
        </label>

        <footer>
          <Link to="/" className="btn btn--secondary">Terug</Link>
          <button type="submit" className="btn btn--primary">Aanmelden</button>
        </footer>
      </form>
    </div>
  );
};

export default LoginPage;
