import React, { Ref } from 'react';

import { gql,useMutation } from '@apollo/client';

export interface CreateUserProps {
    
}

const CREATE_USER = gql`
    mutation CreateUser($name: String!, $email: String!, $password: String!) {
      createUser(name: $name, email: $email, $password, $password) { 
        data
      }
    }
`;

const CreateUserPage: React.FC<CreateUserProps> = () => {
  const [createUser, {data}] = useMutation(CREATE_USER)

  return (
    <></>
  );
};

export default CreateUserPage;
