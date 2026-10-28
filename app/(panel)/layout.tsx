import { AdminShell } from "@/components/AdminShell";

export default function PanelLayout({ children }: LayoutProps<"/">) {
  return <AdminShell>{children}</AdminShell>;
}
