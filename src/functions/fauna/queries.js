// const faunadb  = require('faunadb'), 
//     {Get, Var, Match, Index, Paginate, Lambda, Map} = faunadb.query;


const query = require('faunadb');

const  {Get, Var, Match, Index, Paginate, Lambda, Map} = query;


module.exports = {

    // return query to get all active product listings
    listProducts: (active) => {
        console.log(Paginate);
        return Map(
            Paginate(Match(Index("product_lister_active"), active)),
            Lambda("productRef", Get(Var("productRef")))
          )
    },


};