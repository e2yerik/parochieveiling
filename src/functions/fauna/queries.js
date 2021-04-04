// const faunadb  = require('faunadb'), 
//     {Get, Var, Match, Index, Paginate, Lambda, Map} = faunadb.query;


const { Collection } = require('faunadb');
const query = require('faunadb');

const  {Get, Var, Match, Index, Paginate, Lambda, Map} = query;


module.exports = {

    // return query to get all active product listings
    listProducts: (active) => {
        return Map(
            Paginate(Match(Index("product_lister_active"), active)),
            Lambda("productRef", Get(Var("productRef")))
          )
    },

    getProductByRef: (code) => {
        return Get(
            Match(Index("product_detail_by_code"), code)
        )
    },

};