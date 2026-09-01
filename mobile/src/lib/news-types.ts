export type NewsArticle = {
  id: string;
  title: string;
  link: string;
  description: string;
  author: string;
  publishedAt: string;
  imageUrl: string | null;
  category: string;
};

export type NewsFilter = "all" | "soccer";
