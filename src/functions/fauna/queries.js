const query = require('faunadb');
const  {Login, Let, Get, Var, Match, Index, Paginate, Lambda, Map, Create, Collection} = query;

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

    // MUTATIONS
    /**
     * Create FQL tatement for login
     * @param {String} email 
     * @param {String} password 
     * @returns 
     */
    login: (email, password) => {
        return Login(Match(Index("account_by_email"), email), {
            password
          })
    },

    /**
     * Create FQL statement for registration
     * @param {String} name 
     * @param {String} email 
     * @param {String} password 
     * @returns 
     */
    register: (name, email, password) => {
        return Let(
            {
                accountRef: Create(Collection("Account"), {
                    data: {
                        email
                    }, credentials: {
                        password
                    }
                }) 
            },
            Create(Collection("User"), {
                data: {
                    name, 
                    account: Var('accountRef')
                }
            })
        )
    },

};