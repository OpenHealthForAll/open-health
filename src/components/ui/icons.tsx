import { LucideProps } from "lucide-react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  HeartPulse,
  Home,
  Leaf,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Pill,
  Plus,
  Ruler,
  Search,
  Settings,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";

export const Icons = {
  moon: Moon,
  leaf: Leaf,
  apple: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 7c-3 0 -4 3 -4 5.5c0 3 2 7.5 4 7.5c1.088 -.046 1.679 -.5 3 -.5c1.312 0 1.5 .5 3 .5s4 -3 4 -5c0 -.023 0 -.047 0 -.07c-2.403 -.963 -3.053 -2.918 -3 -5.93c-1.333 -.219 -2.333 -1.5 -3 -3c-.667 2.667 -2.333 5.5 -4 5.5z" />
      <path d="M12 4a2 2 0 0 0 2 -2a2 2 0 0 0 -2 2" />
    </svg>
  ),
  google: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17.788 5.108a9 9 0 1 0 3.212 6.892h-8" />
    </svg>
  ),
  user: User,
  settings: Settings,
  bell: Bell,
  logout: LogOut,
  menu: Menu,
  search: Search,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  plus: Plus,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  messageSquare: MessageSquare,
  activity: Activity,
  heart: Heart,
  sparkles: Sparkles,
  calendar: Calendar,
  fileText: FileText,
  home: Home,
  building2: Building2,
  clock: Clock,
  heartPulse: HeartPulse,
  pill: Pill,
  ruler: Ruler,
  stethoscope: Stethoscope
}; 