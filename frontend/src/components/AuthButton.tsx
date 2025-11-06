import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          Signed in as {session.user?.name || session.user?.email}
        </span>
        <Button variant="destructive" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn("github")}>
      Sign in with GitHub
    </Button>
  );
}