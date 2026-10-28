export const LANGS = [
  { key: "ru", label: "RU", name: "Русский" },
  { key: "en", label: "EN", name: "English" },
  { key: "tk", label: "TK", name: "Türkmençe" },
] as const;

export type Lang = (typeof LANGS)[number]["key"];
export type Localized<T = string> = Record<Lang, T>;

export const emptyText = (): Localized => ({ en: "", ru: "", tk: "" });
export const emptyList = (): Localized<string[]> => ({ en: [], ru: [], tk: [] });

/** Russian first, then any filled translation — for table cells */
export const showText = (value?: Partial<Localized> | null) =>
  value?.ru || value?.en || value?.tk || "—";

export type Service = {
  id: number;
  slug: string;
  title: Localized;
  tags: Localized<string[]>;
  description: Localized;
  images: string[];
  isPublished: boolean;
  sortOrder: number;
};

export type Country = { id: number; slug: string; name: Localized; sortOrder: number };

export type Project = {
  id: number;
  slug: string;
  title: Localized;
  description: Localized;
  content: Localized;
  coverImage: string;
  gallery: string[];
  serviceId: number;
  countryId: number;
  city: Localized;
  client: string;
  year: number;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder: number;
  featuredDescription: Localized | null;
  sortOrder: number;
  serviceTitle: Localized;
  countryName: Localized;
};

export type TeamMember = {
  id: number;
  name: string;
  role: Localized;
  photo: string;
  isPublished: boolean;
  sortOrder: number;
};

export type Brand = { id: number; name: string; logo: string; isPublished: boolean; sortOrder: number };

export type Position = {
  id: number;
  slug: string;
  title: Localized;
  description: Localized;
  requirements: Localized<string[]>;
  employmentType: Localized;
  location: Localized;
  isPublished: boolean;
  sortOrder: number;
};

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number };

export type ContactRequest = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  categoryLabel: string;
  description: string;
  locale: string;
  status: "new" | "in_progress" | "done" | "spam";
  adminNote: string;
  createdAt: string;
};

export type Application = {
  id: number;
  positionTitle: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  resumeOriginalName: string;
  resumeSize: number;
  locale: string;
  status: "new" | "reviewed" | "interview" | "rejected" | "hired";
  adminNote: string;
  createdAt: string;
};

export type FieldType = "text" | "textarea" | "image";

export type PageSection = {
  key: string;
  title: string;
  fields: { name: string; label: string; type: FieldType }[];
  data: Record<string, Localized | string>;
  updatedAt: string | null;
};

export type SitePage = { key: string; title: string; sections: PageSection[] };

export type Settings = {
  contacts: {
    phone: string;
    email: string;
    address: Localized;
    googleMapsUrl: string;
    mapCoordinates: string;
    instagram: string;
    tiktok: string;
  };
  notifications: { emails: string[] };
};

export type AdminUser = { id: number; email: string; name: string };
