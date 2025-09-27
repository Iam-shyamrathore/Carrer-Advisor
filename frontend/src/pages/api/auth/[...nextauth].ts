import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import axios from "axios";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) {
        return false; // Do not allow sign-in if email or account is missing
      }
      try {
        // This is a server-to-server call, so we use the full URL.
        const apiEndpoint = `${process.env.BACKEND_API_URL}/auth/upsert-user`;

        const backendUser = await axios.post(apiEndpoint, {
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });

        // Attach the database ID to the user object to be used in the session callback
        user.id = backendUser.data.id;
        
        return true; // Continue the sign-in process
      } catch (error) {
        console.error("Error during signIn callback:", error);
        return false; // Prevent sign-in if backend call fails
      }
    },
    async session({ session, token }) {
      // The `signIn` callback attached the ID to the user object,
      // which NextAuth passes to the `jwt` callback, which then puts it on the `token`.
      // The `session` callback takes that ID from the token and puts it on the session.
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      // The `user` object is only available the first time a user signs in.
      // We are taking the ID we got from our backend and putting it on the JWT token.
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});