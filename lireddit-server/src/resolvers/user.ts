import { User } from "../entities/User"
import { MyContext } from "../types"
import { Resolver, Arg, InputType, Field, Mutation, Ctx, ObjectType, Query } from "type-graphql"

// Used to hash password
import argon2 from "argon2"
import { COOKIE_NAME } from "../constants";

//Allows you to create an object rather than multiple @Arg, can also be reused
// InputType are for inputs obvs
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

// ObjectTypes are returned
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver{
  @Query(() => [User])
  users( @Ctx() {em}: MyContext ) : Promise<User[]> {
    return em.find(User, {});
  }

  @Query(() => User, {nullable: true})
  async me( @Ctx() { em, req }: MyContext ): Promise<User | null> {
    if (!req.session.userID) {
      return null
    }


    const user = await em.findOne(User, { _id: req.session.userID })
    return user;
  }
  
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput ) options: UsernamePasswordInput,
    @Ctx() {em, req} : MyContext
  ) : Promise<UserResponse> {

    if (options.username.length <= 2) {
      return {
        errors: [{
          field: "username",
          message: "Length must be greater than two"
        }]
      }
    }

    if (options.password.length <= 2) {
      return {
        errors: [{
          field: "password",
          message: "Length must be greater than two"
        }]
      }
    }

    const hashedPassword = await argon2.hash(options.password)

    /*
    let user;
    try {
      const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
        username: options.username,
        password: hashedPassword,
        // Graphql changes fromat from createdAt, knex doesnt know this so it has t reflect
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*')
      user = result[0];

    } catch(err) {
      if (err.code === "23505"){//err.detail.includes("already exists")) {
        // duplicate user error
        return {
          errors: [{
            field: "username",
            message: "Username already taken"
          }]
        }

      }
      console.log("message: ", err.message)
    }
    */
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword
    })

    try {
      await em.persistAndFlush(user)
    } catch(err) {
      if (err.code === '23505'){// || err.detail.includes("already exists")) {
        // duplicate user error
        return {
          errors: [{
            field: "username",
            message: "Username already taken"
          }]
        }

      }
      console.log("message: ", err.message)
    }

    // This will create a cookie and keep the user logged in
    req.session.userID = user._id;
    
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput ) options: UsernamePasswordInput,
    @Ctx() {em, req } : MyContext
  ) : Promise<UserResponse> {
    const user = await em.findOne(User, {username: options.username});

    if (!user){
      return {
        errors: [{
          field: "username",
          message: "That username doesn't exist"
        }]
      }
    }

    const valid = await argon2.verify(user.password, options.password)

    if (!valid){
      return {
        errors: [{
          field: "password",
          message: "Incorrect Password"
        }]
      }
    }

    req.session.userID = user._id;

    return{
      user,
    }

  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() {req, res}: MyContext
  ){
    
    return new Promise ((resolve) =>
     req.session.destroy((err) => {
       // Always clears cookie even if session fais to destroy
      res.clearCookie(COOKIE_NAME);
      if (err) {
        console.log(err);
        resolve(false);
        return;
      }
      resolve(true)
    }))
  }
}

