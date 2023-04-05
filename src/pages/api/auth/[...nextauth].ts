/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import NextAuth, {type NextAuthOptions} from "next-auth"; 
import GoogleProvider from "next-auth/providers/google"; 
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import {env} from "../../../env/server.mjs";
import { prisma } from "../../../server/db";
export const authOptions: NextAuthOptions = {
    callbacks: {
        session({session, user}){
            if(session.user){
                session.user.id = user.id
        }
        return session;
        }
    },


adapter: PrismaAdapter(prisma),
providers: [
    GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
], 

pages: {
    //signIn: "/signin",
}
};

export default NextAuth(authOptions);
