const { ApolloServer } = require("apollo-server-lambda");
const faunadb  = require('faunadb');
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
  
  type Query {
    allProducts(active: Boolean): [Product]
    product(code: String): Product
    # accountsByEmail(email: String!): [Account!]!
  }
  
  type Mutation {
    #   # register(email: String!, password: String!): Account! @resolver
    login(email: String!, password: String!): String!
    #   # buyProduct(productId: Int!, priceValue: Int!): Boolean @resolver
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
        login: () => {

            
        }
    },

};

const server = new ApolloServer({
    typeDefs,
    resolvers
});
  
exports.handler = server.createHandler();