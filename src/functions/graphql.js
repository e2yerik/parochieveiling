const { ApolloServer, gql } = require("apollo-server-lambda");
const { readFileSync } = require('fs');

const fqlQueries = require('./fauna/queries');

const { flattenDataKeys } = require('./fauna/util');

const faunadb  = require('faunadb'), 
    {Get, Var, Match, Index, Paginate, Lambda, Map} = faunadb.query;

const typeDefs = gql `${readFileSync('schema/netlify.graphql').toString('utf-8')}`;

// const fqlQueries = {
//     listProducts: (active) => {
//         return Map(
//             Paginate(Match(Index("product_lister_active"), active)),
//             Lambda("productRef", Get(Var("productRef")))
//           )
//     }
// };

let faunaKey = process.env.REACT_APP_BOOTSTRAP_FAUNADB_KEY;


// function flattenDataKeys(obj) {
//     if (Array.isArray(obj)) {
//       return obj.map(e => flattenDataKeys(e))
//     } else if (typeof obj === 'object') {
//       // the case where we have just data pointing to an array.
//       if (Object.keys(obj).length === 1 && obj.data && Array.isArray(obj.data)) {
//         return flattenDataKeys(obj.data)
//       } else {
//         Object.keys(obj).forEach(k => {
//           if (k === 'data') {
//             const d = obj[k]
//             delete obj.data
  
//             Object.keys(d).forEach(dataKey => {
//               obj[dataKey] = flattenDataKeys(d[dataKey])
//             })
//           } else {
//             obj[k] = flattenDataKeys(obj[k])
//           }
//         })
//       }
//       return obj
//     } else {
//       return obj
//     }
//   }
  
//   function isFunction(functionToCheck) {
//     return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
//   }

const resolvers = {
    Query: {
        allProducts: async (active) => {
            var client = new faunadb.Client({ secret: faunaKey })

            let response = await client.query(fqlQueries.listProducts(false))
                .then(res => flattenDataKeys(res));
                
            // console.log('Fauna response', {response});

            return [...response];
        }
    },

    Mutation: {
        // buyProduct: (productId, priceValue) => {
        //     console.log('Buy product ', {productId, priceValue});
        //     return false;
        // },
        login: () => {

        }
    },

};

const server = new ApolloServer({
    typeDefs,
    resolvers
});
  
exports.handler = server.createHandler();