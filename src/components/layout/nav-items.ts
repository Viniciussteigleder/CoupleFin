import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Flag,
  LayoutGrid,
  LineChart,
  List,
  ListChecks,
  PiggyBank,
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
    label: "Contas",
    href: "/contas",
    icon: CreditCard,
  },
  {
    label: "Metas",
    href: "/metas",
    icon: Flag,
  },
  {
    label: "Insights",
    href: "/insights",
    icon: LineChart,
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
    label: "Orcamento",
    href: "/orcamento",
    icon: PiggyBank,
  },
  {
    label: "Logs",
    href: "/logs",
    icon: ReceiptText,
  },
];

export const settingsItem = {
  label: "Configuracoes",
  href: "/settings",
};
