import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useLocation } from "react-router-dom";
import TopNav from "../components/navs/TopNav";
import { HiBars3 } from "react-icons/hi2";
import Sidebar from "../components/navs/Sidebar";
import FloatingContactWidget from "../components/ui/FloatingContactWidget";
import type { LayoutProps } from "../lib/interfaces";

const MainLayout = ({
  children,
  pageName,
}: LayoutProps) => {
  useEffect(() => {
    document.title = "Payfleet  - " + pageName;
  }, [pageName]);

  const location = useLocation();
  const mainContentRef = useRef<HTMLDivElement | null>(null);
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      x: -20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1.0,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 1.0,
        ease: "easeInOut",
      },
    },
  };

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const style = document.createElement("style");
    style.textContent = `
      .main-content {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overflow-anchor: none;
          scroll-padding-top: 80px;
          overscroll-behavior-y: contain;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useLayoutEffect(() => {
    const scrollToTop = () => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        if (mainContentRef.current?.scrollTop !== 0) {
          mainContentRef.current?.scrollTo(0, 0);
        }
        if (window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }
      }, 300);
    };

    const rafId = requestAnimationFrame(() => {
      scrollToTop();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full relative! bg-secondary h-dvh overflow-hidden px-4 py-3">
      <div className="md:px-6 px-4 flex gap-2 sticky top-0 z-10 items-center bg-tertiary rounded-xl">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="lg:hidden block text-textBlack"
        >
          <HiBars3 size={20} />
        </button>
        <TopNav />
      </div>
      <div className="relative flex items-start h-[calc(100vh-90px)]">
        {/* Mobile overlay backdrop (does not slide) */}
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          className={`lg:hidden fixed inset-0 z-[100] bg-black/60 transition-opacity duration-500 ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Left Navigation drawer */}
        <div
          className={`w-[85%] md:w-[70%] lg:w-[20%] h-dvh lg:h-full rounded-none lg:rounded-2xl overflow-hidden fixed top-0 left-0 lg:static z-[110] transition-transform duration-500 ${
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <Sidebar setIsOpen={setIsOpen} />
        </div>
        <div className={`lg:w-[80%] w-full h-full overflow-hidden`}>
          <div
            ref={mainContentRef}
            className={`h-full`}
            style={{
              minHeight: "0",
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorY: "contain",
            }}
            tabIndex={-1}
          >
            <AnimatePresence mode="wait">
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                style={{
                  minHeight: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                className="md:px-4 h-full overflow-y-scroll no-scrollbar"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floating contact support icon for company users */}
        {!location.pathname.startsWith("/admin") && !location.pathname.startsWith("/support") && !location.pathname.startsWith("/financial") && (
          <FloatingContactWidget />
        )}
      </div>
    </div>
  );
};

export default MainLayout;
