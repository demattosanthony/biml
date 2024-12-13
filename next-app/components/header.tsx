import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
      </div>
    </header>
  );
}
