import {
  Briefcase,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Home,
  Pickaxe,
  ShieldCheck,
  Sprout,
  Wheat,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  agriculture: Sprout,
  health: HeartPulse,
  education: GraduationCap,
  women: HandHeart,
  housing: Home,
  business: Briefcase,
  social_security: ShieldCheck,
  employment: Pickaxe,
  energy: Zap,
  food: Wheat,
};

export const iconFor = (category: string): LucideIcon => CATEGORY_ICONS[category] ?? ShieldCheck;
