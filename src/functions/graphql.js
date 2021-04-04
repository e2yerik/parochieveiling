const { ApolloServer, gql } = require("apollo-server-lambda");
const { readFileSync } = require('fs');

const fqlQueries = require('./fauna/queries');
const { flattenDataKeys } = require('./fauna/util');

const faunadb  = require('faunadb');
const typeDefs = gql `${readFileSync('./schema/netlify.graphql').toString('utf-8')}`;

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