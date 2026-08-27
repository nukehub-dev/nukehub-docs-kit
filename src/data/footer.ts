import type { FooterColumn, FooterLink } from "../lib/footer";

export const footerColumns: FooterColumn[] = [
  {
    title: "Project",
    links: [
      {
        title: "NukeHub",
        url: "https://nukehub.org",
        newpage: true,
      },
      {
        title: "NukeBlog",
        url: "https://blog.nukehub.org",
        newpage: true,
      },
      {
        title: "NukeTalk",
        url: "https://talk.nukehub.org",
        newpage: true,
      },
    ],
  },
  {
    title: "Legal",
    links: [
      {
        title: "License",
        url: "https://github.com/nukehub-dev/docs-template/blob/main/LICENSE",
        newpage: true,
      },
    ],
  },
];

export const footerLegal: FooterLink[] = [];
