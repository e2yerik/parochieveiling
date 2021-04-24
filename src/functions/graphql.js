const { ApolloServer } = require("apollo-server-lambda");
const faunadb = require("faunadb");
const { login } = require("./fauna/queries");
const fqlQueries = require("./fauna/queries");
const { flattenDataKeys } = require("./fauna/util");

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
    imageUrl: String!
  
    """
    product list thumbnail
    """
    thumbUrl: String!
  
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
    name: String
  }

  type CreateProductResponse {
    message: String
    description: String
    code: String
  }

  type Query {
    allProducts(active: Boolean): [Product]
    product(code: String): Product
  }
  
  type Mutation {
    login(email: String!, password: String!): LoginResponse!
    register(name: String!, email: String!, password: String!): RegisterResponse!
    createProduct(
      name: String!,
      code: String!,
      shortDescription: String,
      longDescription: String,
      imageUrl: String!,
      thumbUrl: String!,
      formattedPrice: String!,
      price: String!,
      priceType: String!
    ): CreateProductResponse!
  }  
`;

const createClient = (secret) => new faunadb.Client({ secret });

const resolvers = {
  Query: {
    allProducts: async (_, args, { faunaClient }) => {
      return await faunaClient
        .query(fqlQueries.listProducts(args.active))
        .then((res) => flattenDataKeys(res));
    },

    product: async (_, args, { faunaClient }) => {
      return await faunaClient
        .query(fqlQueries.getProductByRef(args.code))
        .then((res) => flattenDataKeys(res));
    },
  },

  Mutation: {
    login: async (_, args, { faunaClient }) => {
      const { email, password } = args;
      console.log("Login ", { date: new Date(), email, password });

      return await faunaClient
        .query(fqlQueries.login(email, password))
        .then((res) => {
          return { secret: res.secret };
        })
        .catch((res) => {
          console.error("failed login", res);
          return {
            message: res.message,
            description: res.description,
          };
        });
    },
    register: async (_, args, { faunaClient }) => {
      const { name, email, password } = args;
      console.log("Registering new account: ", {
        data: new Date(),
        name,
        email,
      });

      return await faunaClient
        .query(fqlQueries.register(name, email, password))
        .then((res) => {
          let { data } = res;
          return {
            name: data.name,
          };
        })
        .catch((res) => {
          console.error("failed register", res);
          return {
            message: res.message,
            description: res.description,
          };
        });
    },

    createProduct: async (_, args, { faunaClient }) => {
      const {
        code,
        name,
        shortDescription,
        longDescription,
        imageUrl,
        thumbUrl,
        formattedPrice,
        price,
        priceType,
      } = args;

      return await faunaClient
        .query(
          fqlQueries.createProduct(
            code,
            name,
            shortDescription,
            longDescription,
            imageUrl,
            thumbUrl,
            formattedPrice,
            price,
            priceType
          )
        )
        .then((res) => {
          console.log("registered product", { code, res });
          return {
            code: res.data.code,
          };
        })
        .catch((res) => {
          console.error("failed product creation", res);
          return {
            message: res.message,
            description: res.description,
          };
        });
    },
  },
};

const context = (ctx) => {
  const secret = ctx.event.headers.authorization || "";

  return {
    faunaClient: createClient(secret),
  };
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

exports.handler = server.createHandler();
