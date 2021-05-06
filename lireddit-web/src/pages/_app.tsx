import { ChakraProvider } from '@chakra-ui/react'
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache'

import theme from '../theme'
import { MeDocument, LoginMutation, MeQuery, RegisterMutation } from '../generated/graphql'

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any)
}

const client = createClient({ 
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
  },

  // This updates the cache 
  // update query after mutation fires
  // If not and say MeQuery comes back not logged in, on login it will be called again but 
  // the cached result will be not logged in still
  exchanges: [dedupExchange, cacheExchange({
    updates: {
        Mutation: {
          login: (_result, args, cache, info) => {
            //cache.updateQuery({query: MeDocument}, data => {});
            // This function adds better typing to above function
            betterUpdateQuery<LoginMutation, MeQuery>(cache, 
              {query: MeDocument},
              _result,
              (result, query) => {
                if (result.login.errors){
                  return query;
                } else {
                  return {
                    me: result.login.user
                  }
                }
              }
            );
          },

          register: (_result, args, cache, info) => {
            //cache.updateQuery({query: MeDocument}, data => {});
            // This function adds better typing to above function
            betterUpdateQuery<RegisterMutation, MeQuery>(cache, 
              {query: MeDocument},
              _result,
              (result, query) => {
                if (result.register.errors){
                  return query;
                } else {
                  return {
                    me: result.register.user
                  }
                }
              }
            );
          }
        }
    }
  }), fetchExchange]
})

function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
          <Component {...pageProps} />
      </ChakraProvider>
    </Provider>

  )
}

export default MyApp
