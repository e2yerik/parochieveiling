const { ApolloServer } = require("apollo-server-lambda");
const faunadb = require("faunadb");
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

    type: String!
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


  type PlaceBidResponse {
    message: String
    description: String
    timeStamp: String  
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

    placeBid(code: String!, bid: String!): PlaceBidResponse
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
        .then((res) => {
          const rawData = flattenDataKeys(res);
          rawData.product.price = rawData.price;
          return rawData.product;
        })
        .catch((res) => {
          console.error("failed product lookup", res);
          return {
            message: res.message,
            description: res.description,
          };
        });
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

    placeBid: async (_, args, { faunaClient }) => {
      const { code, bid } = args;
      console.log("place bid ", { args });

      let canPlaceBid = false;

      await faunaClient
        .query(fqlQueries.getBidsForProduct(code))
        .then((res) => {
          const currentBid = parseFloat(bid);
          console.log("response bids", { res: res, currentBid });

          const bigBids = res.filter(
            (r) => parseFloat(r.data.priceValue) > currentBid
          );

          console.log("found higher bids", {
            bigBids: bigBids.map((r) => r.data.priceValue),
          });

          canPlaceBid = bigBids == undefined || bigBids.length == 0;
        })
        .catch((res) => {
          console.error("failed place bid", res);
          return {
            message: res.message,
            description: res.description,
          };
        });

      if (!canPlaceBid) {
        return {
          message: "Overboden",
          description:
            "Er is al een beter bod uitgebracht. Probeer het opnieuw met een hoger bod",
        };
      }
      return await faunaClient
        .query(fqlQueries.placeBid(code, bid))
        .then((res) => {
          console.log("place bid response", { code, bid, res });

          return {
            timeStamp: res.ts,
          };
        })
        .catch((res) => {
          console.error("failed place bid", res);
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
