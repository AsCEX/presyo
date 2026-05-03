import React, { useState, useEffect } from "react";
import { api, User } from "../api/mockApi";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { 
  LayoutDashboard, 
  Package,
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Fingerprint,
  ShieldOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { bufferToBase64URL } from "../lib/webauthnUtils";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  activePath: "dashboard" | "products" | "customers" | "settings";
}

export const Layout: React.FC<LayoutProps> = ({ children, title, activePath }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    localStorage.getItem("sidebar_collapsed") === "true"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    if (!currentUser) {
      window.location.reload(); // Redirect logic handled in main.tsx usually, but for now
      return;
    }
    setUser(currentUser);
    setHasPasskey(api.hasPasskey());
  }, []);

  const handleRegisterPasskey = async () => {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userID = new Uint8Array(16);
      window.crypto.getRandomValues(userID);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Presyo",
          id: window.location.hostname,
        },
        user: {
          id: userID,
          name: user?.username || "admin",
          displayName: user?.name || "Administrator",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "required",
          requireResidentKey: true,
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none",
      };

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      if (credential) {
        const credentialData = {
          id: credential.id,
          rawId: bufferToBase64URL(credential.rawId),
          type: credential.type,
        };
        await api.registerPasskey(credentialData);
        setHasPasskey(true);
        alert("Passkey registered successfully! You can now use biometrics to login.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to register passkey. " + (err instanceof Error ? err.message : ""));
    }
  };

  const handleClearPasskey = () => {
    if (confirm("Are you sure you want to clear your registered passkey? You will need to use your password to login next time.")) {
      api.clearPasskey();
      setHasPasskey(false);
      alert("Passkey cleared successfully.");
    }
  };

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", String(newState));
  };

  const handleLogout = () => {
    api.logout();
    window.location.reload();
  };

  const navigate = (path: string) => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: path }));
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    /*{ id: "customers", label: "Customers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },*/
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarCollapsed ? "w-16" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <div className={cn("flex items-center gap-2 font-semibold", isSidebarCollapsed && "justify-center w-full")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Package className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && <span className="text-xl tracking-tight">Presyo</span>}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => navigate(item.id)}
              className={cn(
                "w-full justify-start gap-3 px-3 py-2 text-sm font-medium",
                activePath === item.id ? "bg-accent text-accent-foreground" : ""
              )}
            >
              <item.icon className="h-4 w-4" />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </Button>
        </div>

        {/* Sidebar Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 hidden h-6 w-6 rounded-full bg-background shadow-sm md:flex"
        >
          {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>

        {/* Mobile Close Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute right-4 top-4 h-8 w-8 md:hidden"
        >
          <X size={18} />
        </Button>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-9 w-9 md:hidden"
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {!hasPasskey && window.PublicKeyCredential && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegisterPasskey}
                className="flex gap-2 border-primary/20 hover:bg-primary/5"
              >
                <Fingerprint className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Enable Passkey</span>
              </Button>
            )}
            {hasPasskey && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearPasskey}
                className="flex gap-2 border-destructive/20 hover:bg-destructive/5 text-destructive"
              >
                <ShieldOff className="h-4 w-4" />
                <span className="hidden sm:inline">Clear Passkey</span>
              </Button>
            )}
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.username}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
