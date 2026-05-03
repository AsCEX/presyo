import React, { useState, useEffect } from "react";
import { api } from "../api/mockApi";
import { ThemeToggle } from "../components/ThemeToggle";
import { Fingerprint } from "lucide-react";
import { base64URLToBuffer } from "../lib/webauthnUtils";

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("618b1a07-a72d-4f68-85a7-88596bc35a08");
  const [error, setError] = useState<string | null>(null);
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);

  useEffect(() => {
    // Check if WebAuthn is supported and if user has a registered passkey
    if (window.PublicKeyCredential) {
      setIsWebAuthnSupported(true);
    }
  }, []);

  const handleWebAuthnLogin = async () => {
    setError(null);
    try {
      const storedPasskey = api.getPasskeyData();
      if (!storedPasskey) {
        setError("No passkey registered on this device");
        return;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            id: base64URLToBuffer(storedPasskey.rawId),
            type: "public-key",
          },
        ],
        userVerification: "required",
        timeout: 60000,
      };

      const assertion = (await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      })) as PublicKeyCredential;

      if (assertion) {
        const response = await api.webAuthnLogin(assertion.id);
        if (response.ok) {
          onLoginSuccess();
        } else {
          setError("Passkey authentication failed");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Passkey authentication failed: " + (err instanceof Error ? err.message : ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.login(username, password);
      if (response.ok) {
        onLoginSuccess();
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Presyo Login</h1>
          <p className="text-sm text-muted-foreground">Enter to the dashboard</p>
        </div>

        {isWebAuthnSupported && api.hasPasskey() ? (
          <div className="mt-6">
            <button
              onClick={handleWebAuthnLogin}
              className="flex flex-col w-full items-center justify-center gap-4 rounded-md px-4 py-8 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-accent"
            >
              <Fingerprint className="h-16 w-16" />
              Sign in with Passkey
            </button>
          </div>
        )
        :
        <>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2 hidden">
              <label className="text-sm font-medium leading-none">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2 hidden">
              <label className="text-sm font-medium leading-none">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Enter
            </button>
          </form>
          {error && <p className="mt-4 text-center text-sm font-medium text-destructive">{error}</p>}
        </>
        }
      </div>
    </div>
  );
};
