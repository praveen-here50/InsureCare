import type { ElementType } from "react";
import { FiActivity, FiClipboard, FiFileText, FiGrid, FiHeart, FiHome, FiLayers, FiMapPin, FiMessageCircle, FiSend, FiSettings, FiShield, FiUsers } from "react-icons/fi";

export type NavItem = { label: string; href: string; icon: ElementType };
export type Portal = {
  key: "patient" | "hospital" | "insurer";
  base: string;
  title: string;
  nav: NavItem[];
  mobile: NavItem[];
  footer?: NavItem;
};

export const PATIENT_PORTAL: Portal = {
  key: "patient", base: "/patient", title: "Patient portal",
  nav: [
    { label: "Dashboard", href: "/patient", icon: FiGrid }, { label: "My Policies", href: "/patient/policies", icon: FiShield },
    { label: "Hospitals", href: "/patient/hospitals", icon: FiHeart }, { label: "Claims", href: "/patient/claims", icon: FiActivity },
    { label: "Documents", href: "/patient/documents", icon: FiFileText }, { label: "Assistant", href: "/patient/assistant", icon: FiMessageCircle },
  ],
  mobile: [
    { label: "Home", href: "/patient", icon: FiHome }, { label: "Policies", href: "/patient/policies", icon: FiShield },
    { label: "Hospitals", href: "/patient/hospitals", icon: FiMapPin }, { label: "Claims", href: "/patient/claims", icon: FiActivity },
    { label: "Documents", href: "/patient/documents", icon: FiFileText },
  ],
  footer: { label: "Settings", href: "/patient/settings", icon: FiSettings },
};

export const HOSPITAL_PORTAL: Portal = {
  key: "hospital", base: "/hospital", title: "Hospital portal",
  nav: [
    { label: "Dashboard", href: "/hospital", icon: FiGrid }, { label: "Bed availability", href: "/hospital/beds", icon: FiLayers },
    { label: "Patients", href: "/hospital/patients", icon: FiUsers }, { label: "Insurer claims", href: "/hospital/claims", icon: FiSend },
    { label: "Services", href: "/hospital/services", icon: FiHeart },
  ],
  mobile: [
    { label: "Home", href: "/hospital", icon: FiHome }, { label: "Beds", href: "/hospital/beds", icon: FiLayers },
    { label: "Patients", href: "/hospital/patients", icon: FiUsers }, { label: "Claims", href: "/hospital/claims", icon: FiSend },
    { label: "Services", href: "/hospital/services", icon: FiHeart },
  ],
};

export const INSURER_PORTAL: Portal = {
  key: "insurer", base: "/insurer", title: "Insurer portal",
  nav: [
    { label: "Dashboard", href: "/insurer", icon: FiGrid }, { label: "Claims", href: "/insurer/claims", icon: FiClipboard },
    { label: "Policyholders", href: "/insurer/policyholders", icon: FiUsers }, { label: "Network hospitals", href: "/insurer/hospitals", icon: FiHeart },
  ],
  mobile: [
    { label: "Home", href: "/insurer", icon: FiHome }, { label: "Claims", href: "/insurer/claims", icon: FiClipboard },
    { label: "Patients", href: "/insurer/policyholders", icon: FiUsers }, { label: "Hospitals", href: "/insurer/hospitals", icon: FiHeart },
  ],
};

export const getPortal = (pathname: string): Portal => (pathname.startsWith("/hospital") ? HOSPITAL_PORTAL : pathname.startsWith("/insurer") ? INSURER_PORTAL : PATIENT_PORTAL);
export const isActive = (portal: Portal, href: string, pathname: string) => (href === portal.base ? pathname === href : pathname.startsWith(href));
