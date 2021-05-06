import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
import express from 'express';
import { ApolloServer} from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import mikroConfig from "./mikro-orm.config";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

// For storing cookies very fast
import redis  from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";

import cors from 'cors'



const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up()

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  // Applys middleware to all routes for cors security
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }))

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ 
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 *365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', //csrf
        secure: __prod__, // Localhost doesnt have https but want for product, this can mess you up
      },
      saveUninitialized: false,
      // This wants to be an environment variable
      secret: "sdfjsdfjvojskdjosjfkokjfd",
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false
    }),
    // This gives all resolvers access to orm.em
    context: ({req, res}): MyContext => ({em: orm.em, req, res})
  });

  apolloServer.applyMiddleware({
    app,
    cors: false
  })

  app.get('/', (_, res) => {
    res.send('hello')
  });

  app.listen(4000, () => {
    console.log('Server started on localhost:4000')
  });
};
 
main().catch( (err) => {
  console.log(err);
});