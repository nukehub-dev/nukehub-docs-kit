import { Globe, Rss, MessageSquare } from "lucide-react";
import type { NavItem } from "../lib/nav";

export const navItems: NavItem[] = [
  {
    title: "NukeHub",
    icon: Globe,
    url: "https://nukehub.org",
    newpage: true,
  },
  {
    title: "NukeBlog",
    icon: Rss,
    url: "https://blog.nukehub.org",
    newpage: true,
  },
  {
    title: "NukeTalk",
    icon: MessageSquare,
    url: "https://talk.nukehub.org",
    newpage: true,
  },
];
