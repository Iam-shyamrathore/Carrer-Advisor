import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <span className="text-gray-300 mr-4">
          Signed in as {session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="px-4 py-2 font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-600"
    >
      Sign in with GitHub
    </button>
  );
}