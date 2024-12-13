import NavigationMenu from "./project-nav-menu";

export default function ProjectPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center flex-col">
      <NavigationMenu />
      {children}
    </div>
  );
}
