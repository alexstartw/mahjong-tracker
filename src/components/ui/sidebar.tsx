"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const open    = openProp    !== undefined ? openProp    : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;
  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => (
  <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
    {children}
  </SidebarProvider>
);

export const SidebarBody = ({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => (
  <>
    <DesktopSidebar className={className} style={style}>{children}</DesktopSidebar>
    <MobileSidebar  className={className} style={style}>{children}</MobileSidebar>
  </>
);

/** Desktop: pure-CSS width transition, no framer-motion */
export const DesktopSidebar = ({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <div
      className={cn("h-full hidden md:flex md:flex-col flex-shrink-0 overflow-hidden", className)}
      style={{
        width: animate ? (open ? "220px" : "52px") : "220px",
        transition: animate ? "width 0.2s ease" : undefined,
        ...style,
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
    </div>
  );
};

/** Mobile: CSS translateX transition, no framer-motion */
export const MobileSidebar = ({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      {/* Mobile top bar */}
      <div
        className="h-14 px-4 flex flex-row md:hidden items-center justify-between w-full border-b flex-shrink-0"
        style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}
      >
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          🀄 麻將記錄
        </span>
        <button
          className="p-1 rounded"
          style={{ color: "var(--sidebar-foreground)" }}
          onClick={() => setOpen(!open)}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[99] md:hidden"
        style={{
          background: "rgba(0,0,0,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-72 z-[100] p-8 flex flex-col justify-between md:hidden",
          className
        )}
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          ...style,
        }}
      >
        <button
          className="absolute right-5 top-5"
          style={{ color: "var(--sidebar-foreground)" }}
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  const visible = !animate || open;
  return (
    <Link
      href={link.href}
      className={cn("flex items-center gap-2 group/sidebar py-2", className)}
      {...props}
    >
      {link.icon}
      <span
        className="text-sm whitespace-nowrap overflow-hidden group-hover/sidebar:translate-x-0.5"
        style={{
          maxWidth:   visible ? "160px" : "0px",
          opacity:    visible ? 1 : 0,
          transition: "max-width 0.2s ease, opacity 0.15s ease, transform 0.15s ease",
          display:    "inline-block",
          color:      "var(--sidebar-foreground)",
        }}
      >
        {link.label}
      </span>
    </Link>
  );
};
