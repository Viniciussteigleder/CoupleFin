import {
  Calendar,
  CheckCircle2,
  LayoutGrid,
  List,
  ListChecks,
  ReceiptText,
  Sparkles,
  Upload,
} from "lucide-react";

export const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    label: "Transacoes",
    href: "/transactions",
    icon: List,
  },
  {
    label: "Uploads",
    href: "/uploads",
    icon: Upload,
  },
  {
    label: "Confirmar",
    href: "/confirmar",
    icon: CheckCircle2,
  },
  {
    label: "Calendario",
    href: "/calendario",
    icon: Calendar,
  },
  {
    label: "Ritual",
    href: "/ritual",
    icon: Sparkles,
  },
  {
    label: "Regras",
    href: "/rules",
    icon: ListChecks,
  },
  {
    label: "Logs",
    href: "/logs",
    icon: ReceiptText,
  },
];

export const settingsItem = {
  label: "Settings",
  href: "/settings",
};
