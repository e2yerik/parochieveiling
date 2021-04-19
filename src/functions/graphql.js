const { ApolloServer } = require("apollo-server-lambda");
const faunadb  = require('faunadb');
const { login } = require("./fauna/queries");
const fqlQueries = require('./fauna/queries');
const { flattenDataKeys } = require('./fauna/util');

const typeDefs = `
type Account {
    email: String!
  }
  
  type User {
    name: String!
    account: Account!
  }
  
  type Price {
    """
    formatted price including currency symbol
    """
    formattedValue: String
  
    """
    raw pric evalue
    """
    value: Float!
  }
  
  type AuctionBid {
    """
    user putting in the bid
    """
    bidder: User
  
    """
    price point
    """
    priceValue: Float
  
    """
    time of bid
    """
    timeStamp: String
  
    """
    product bid on
    """
    product: Product!
  }
  
  type Image {
    url: String!
    altText: String!
  }
  
  type Product {
    available: Boolean
  
    code: String!
    name: String!
  
    """
    short description < 80 characters
    """
    shortDescription: String!
  
    """
    complete description
    """
    longDescription: String!
  
    """
    product large image
    """
    image: Image!
  
    """
    product list thumbnail
    """
    thumb: Image!
  
    """
    positive integer available products for sale. Stock is reduced when user places bid
    """
    stock: Int
  
    """
    fixed price
    """
    price: Price!
  
    """
    Minimum price for this product
    """
    minPrice: Price
  }
  
  type LoginResponse {
    message: String
    description: String
    secret: String
  }

  type RegisterResponse {
    message: String
    description: String
    email: String
    name: String
  }

  type Query {
    allProducts(active: Boolean): [Product]
    product(code: String): Product
  }
  
  type Mutation {
    login(email: String!, password: String!): LoginResponse!
    register(name: String!, email: String!, password: String!): RegisterResponse!
  }  
`;

let faunaKey = process.env.REACT_APP_BOOTSTRAP_FAUNADB_KEY;

const createClient = () => new faunadb.Client({ secret: faunaKey });

const resolvers = {
    Query: {
        allProducts: async (_, args) => {
            return await createClient()
                .query(fqlQueries.listProducts(args.active))
                    .then(res => flattenDataKeys(res));
        },

        product: async (_, args) => {
            return await createClient()
                .query(fqlQueries.getProductByRef(args.code))
                    .then(res => flattenDataKeys(res));
        }
    },

    Mutation: {
      login: async(_, args) => {
        const {email, password} = args;
        console.log('Login ', {date: new Date(), email, password});

        return await createClient()
          .query(fqlQueries.login(email, password))
          .then(res => {
            console.log('res login', {secret});

            return {secret: res.secret};
          })
          .catch(res => {
            console.error('failed login', res);
            return {
              message: res.message,
              description: res.description
            }
          });
      },
        register: async (_, args) => {
          const {name, email, password} = args;
          console.log('Registering new account: ', {data: new Date(), name, email});

          return await createClient()
            .query(fqlQueries.register(name, email, password))            
              .then(res => {
                let {data} = res;
                return {
                  ...data.account.data,
                  name: data.name
                }
              })
              .catch(res => {
                console.error('failed register', res);
                return {
                  message: res.message,
                  description: res.description
                }
              });
        }
    },

};

const server = new ApolloServer({
    typeDefs,
    resolvers
});
  
exports.handler = server.createHandler();