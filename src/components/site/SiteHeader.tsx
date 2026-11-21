import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Find Schemes" },
  { to: "/categories", label: "Categories" },
  { to: "/eligibility", label: "Eligibility Quiz" },
  { to: "/saved", label: "Saved" },
  { to: "/tracker", label: "Track Application" },
] as const;

const navClass = "whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors";
const navActive = "bg-primary text-primary-foreground";
const navIdle = "text-primary/80 hover:bg-surface-low hover:text-primary";

export function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    void navigate({ to: "/", search: { q: q.trim() || undefined } });
    setOpen(false);
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  const displayName =
    (user?.user_metadata?.["full_name"] as string | undefined) ??
    (user?.user_metadata?.["name"] as string | undefined) ??
    user?.email?.split("@")[0];

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 xl:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={navClass}
              activeProps={{ className: navActive }}
              inactiveProps={{ className: navIdle }}
              activeOptions={{ exact: n.to === "/", includeSearch: false }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={onSearch} className="relative hidden 2xl:block" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search schemes…"
              aria-label="Search schemes"
              className="h-10 w-56 rounded-md border border-border bg-surface-low pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </form>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-low">
                  <span className="grid size-9 place-items-center rounded-full bg-surface-high font-display text-sm font-bold text-primary">
                    {(displayName ?? "U").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden text-left leading-tight md:block">
                    <span className="block max-w-[9rem] truncate text-sm font-semibold">{displayName}</span>
                    <span className="block text-xs font-medium text-emerald-text">Signed in</span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/tracker">My applications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/saved">Saved schemes</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="lg" className="px-4">
              <Link to="/auth">
                <UserRound /> Sign in
              </Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-display">Menu</SheetTitle>
              </SheetHeader>
              <form onSubmit={onSearch} className="relative mt-4 px-4" role="search">
                <Search className="pointer-events-none absolute left-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search schemes…"
                  aria-label="Search schemes"
                  className="h-11 w-full rounded-md border border-border bg-surface-low pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </form>
              <nav className="mt-4 flex flex-col gap-1 px-4" aria-label="Mobile">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={`${navClass} py-3 text-base`}
                    activeProps={{ className: navActive }}
              inactiveProps={{ className: navIdle }}
                    activeOptions={{ exact: n.to === "/", includeSearch: false }}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
