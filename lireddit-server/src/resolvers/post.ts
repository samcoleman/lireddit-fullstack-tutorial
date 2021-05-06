import { Post } from "../entities/Post"
import { MyContext } from "../types"
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql"

@Resolver()
export class PostResolver{
  @Query(() => [Post])
  posts( @Ctx() {em}: MyContext ) : Promise<Post[]> {
    return em.find(Post, {});
  }

  // Graphql requres Post | Null to be expressed like this 
  @Query(() => Post, {nullable: true})
  post(
    // Arg "_id" schema name, _id is the variable name
    @Arg("_id", () => Int) _id: number,
    @Ctx() {em}: MyContext ) : Promise<Post | null> {
      return em.findOne(Post, { _id });
  }

  @Mutation(() => Post)
  async createPost(
    // Arg "_id" schema name, _id is the variable name
    @Arg("title", () => String) title: String,
    @Ctx() {em}: MyContext ) : Promise<Post> {
      const post = em.create(Post, {title});
      await em.persistAndFlush(post);
      return post;
  }

  @Mutation(() => Post, {nullable: true})
  async updatePost(
    @Arg("_id", () => Int) _id: number,
    @Arg("title", () => String, {nullable:true}) title: string,
    @Ctx() {em}: MyContext ) : Promise<Post | null> {
      const post = await em.findOne(Post, { _id });

      if (!post){
        return null;
      }

      if (typeof title !== 'undefined'){
        post.title = title;
        await em.persistAndFlush(post);
      }
      return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("_id", () => Int) _id: number,
    @Ctx() { em }: MyContext ) : Promise<Boolean> {
      await em.nativeDelete(Post, {_id} );
      return true;
  }
}