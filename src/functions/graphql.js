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
    address: String!
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
    name: String
    step: Int
    parentProduct: Product
    relatedProducts: [Product]


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
    productBid(code: String): Price
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
      step: Int
      parentProductCode: String
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
        .then(async (res) => {
          const result = flattenDataKeys(res);
          const enriched = await result.map(async (p) => {
            if (p.parentProduct) {
              p.parentProduct = await faunaClient
                .query(fqlQueries.getProduct(p.parentProduct))
                .then((res) => flattenDataKeys(res))
                .catch((res) => {
                  console.log("failed parentProduct", { res });
                  return null;
                });
            }

            return p;
          });

          return enriched;
        })
        .catch((res) => {
          console.error("failed product lookup", res);
          return {
            message: res.message,
            description: res.description,
          };
        });
    },

    product: async (_, args, { faunaClient }) => {
      return await faunaClient
        .query(fqlQueries.getProductByRef(args.code))
        .then(async (res) => {
          const rawData = flattenDataKeys(res);
          rawData.product.price = rawData.price;

          rawData.product.relatedProducts = await faunaClient
            .query(fqlQueries.allProducts())
            .then((res) => {
              const all = flattenDataKeys(res);
              console.log("all", { all });
              const fi = all
                .filter(
                  ({ product }) =>
                    `${product.parentProduct}` === `${rawData.product.ref}`
                )
                .map(({ product, price }) => {
                  return {
                    ...product,
                    price,
                  };
                });

              console.log("fi", { fi });

              return fi;
            });

          console.log("related", rawData.product.relatedProducts);
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

    /**
     * Give all bids related to product
     * @param {*} _
     * @param {*} args contains code attribute
     * @param {*} param2
     * @returns
     */
    productBid: async (_, args, { faunaClient }) => {
      console.log("find bids", { code: args.code });
      return await faunaClient
        .query(fqlQueries.getProductBidByProductCode(args.code))
        .then((res) => {
          const rawData = flattenDataKeys(res);
          console.log("res", { rawData });

          // rawData.product.price = rawData.price;
          if (rawData) {
            return {
              value: Math.max(...rawData.map((bid) => bid[1])),
              formattedValue: "",
            };
          }
          return null;
        })
        .catch((res) => {
          console.error("failed bid lookup", res);
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
      const { name, email, password, address } = args;
      console.log("Registering new account: ", {
        data: new Date(),
        name,
        email,
        address,
      });

      return await faunaClient
        .query(fqlQueries.register(name, email, password, address))
        .then((res) => {
          let { data } = res;
          return {
            name: `${data.name} (${data.address})`,
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
        step,
        parentProductCode,
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
            priceType,
            step
          )
        )
        .then(async (res) => {
          console.log("registered product", { code, res });

          if (parentProductCode) {
            console.log("rlinking", { parentProductCode });

            return await faunaClient
              .query(fqlQueries.linkProduct(res.ref, parentProductCode))
              .then((pr) => {
                console.log("linked", { pr });
                return {
                  code: pr.data.code,
                };
              })
              .catch((res) => {
                console.error("failed product link", res);
                return {
                  message: res.message,
                  description: res.description,
                };
              });
          }

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
