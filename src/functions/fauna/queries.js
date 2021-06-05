const query = require("faunadb");
const {
  Login,
  Let,
  Get,
  Var,
  Match,
  Index,
  Paginate,
  Lambda,
  Map,
  Create,
  Collection,
  Select,
  CurrentIdentity,
  If,
  Exists,
  Update,
  Epoch,
  Format,
} = query;

module.exports = {
  // return query to get all active product listings

  allProducts: () => {
    return Map(
      Paginate(Match(Index("allProducts"))),
      Lambda(
        "productRef",

        Let(
          {
            productRef: Get(Var("productRef")),
            price: Get(Select(["data", "price"], Var("productRef"))),
          },
          { product: Var("productRef"), price: Var("price") }
        )
      )
    );
  },

  getProduct: (productRef) => {
    return Get(productRef);
  },

  listProducts: (active) => {
    return Map(
      Paginate(Match(Index("product_lister_active"), active)),
      Lambda("productRef", Get(Var("productRef")))
    );
  },

  getProductByRef: (code) => {
    return Let(
      {
        productRef: Get(Match(Index("product_detail_by_code"), code)),
        price: Get(Select(["data", "price"], Var("productRef"))),
      },
      { product: Var("productRef"), price: Var("price") }
    );
  },

  getProductBidByProductCode: (code) => {
    return Let(
      {
        productMatch: Match(Index("product_detail_by_code"), code),
      },
      If(
        Exists(Var("productMatch")),

        Paginate(
          Match(
            Index("product_bids_by_code"),
            Select(["data", 0], Paginate(Var("productMatch")))
          )
        ),
        false
      )
    );
  },

  // MUTATIONS
  /**
   * Create FQL statement for login
   * @param {String} email
   * @param {String} password
   * @returns
   */
  login: (email, password) => {
    return Login(Match(Index("account_by_email"), email), {
      password,
    });
  },

  /**
   * Create FQL statement for registration
   * @param {String} name
   * @param {String} email
   * @param {String} password
   * @param {String} address
   * @returns
   */
  register: (name, email, password, address) => {
    return Let(
      {
        accountRef: Create(Collection("Account"), {
          data: {
            email,
          },
          credentials: {
            password,
          },
        }),
      },
      Create(Collection("User"), {
        data: {
          name,
          address,
          account: Select(["ref"], Var("accountRef")),
        },
      })
    );
  },

  /**
   * Create a new Product and related Price
   * @param {*} code
   * @param {*} name
   * @param {*} shortDescription
   * @param {*} longDescription
   * @param {*} imageUrl
   * @param {*} thumbUrl
   * @param {*} formattedPrice
   * @param {*} price
   * @param {*} priceType
   * @returns
   */
  createProduct: (
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
  ) => {
    return Let(
      {
        priceRef: Create(Collection("Price"), {
          data: {
            value: price,
            formattedValue: formattedPrice,
            type: priceType,
          },
        }),
      },
      Create(Collection("Product"), {
        data: {
          code,
          name,
          shortDescription,
          longDescription,
          imageUrl,
          thumbUrl,
          price: Select(["ref"], Var("priceRef")),
          active: true,
          step,
        },
      })
    );
  },

  linkProduct: (ref, parentProductCode) => {
    return Let(
      {
        parentMatch: Match(Index("product_detail_by_code"), parentProductCode),
      },
      If(
        Exists(Var("parentMatch")),

        Update(ref, {
          data: {
            parentProduct: Select(["data", 0], Paginate(Var("parentMatch"))),
          },
        }),

        false
      )
    );
  },

  placeBid: (code, bid) => {
    return Let(
      {
        productMatch: Match(Index("product_detail_by_code"), code),
      },
      If(
        Exists(Var("productMatch")),

        Create(Collection("AuctionBid"), {
          data: {
            bidder: CurrentIdentity(),
            priceValue: bid,
            product: Select(["data", 0], Paginate(Var("productMatch"))),
          },
        }),

        false
      )
    );
  },

  getBidsForProduct: (code) => {
    return Let(
      {
        productMatch: Match(Index("product_detail_by_code"), code),
      },
      If(
        Exists(Var("productMatch")),

        Map(
          Select(
            ["data"],
            Select(
              ["data", 0],
              Map(
                Paginate(Var("productMatch")),
                Lambda(
                  ["ref"],
                  Paginate(Match(Index("product_bids"), Var("ref")))
                )
              )
            )
          ),
          Lambda("auctionRef", Get(Var("auctionRef")))
        ),

        false
      )
    );
  },

  getUserBids: () => {
    return Map(
      Paginate(Match(Index("bids"), CurrentIdentity())),
      Lambda(
        "ref",
        Let(
          {
            iRef: Get(Var("ref")),
            productRef: Get(Select(["data", "product"], Var("iRef"))),
            timeStamp: Epoch(Select("ts", Var("iRef")), "microsecond"),
          },
          {
            product: Var("productRef"),
            timeStamp: Format("%t", Var("timeStamp")),
            priceValue: Select(["data", "priceValue"], Var("iRef")),
          }
        )
      )
    );
  },
};
