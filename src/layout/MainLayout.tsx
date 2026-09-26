import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useLocation } from "react-router-dom";
import TopNav from "../components/navs/TopNav";
import { HiBars3 } from "react-icons/hi2";
import Sidebar from "../components/navs/Sidebar";
import FloatingContactWidget from "../components/ui/FloatingContactWidget";
import type { LayoutProps } from "../lib/interfaces";
import { assets } from "../assets/assets";
import { FaXmark } from "react-icons/fa6";

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
      <div className="flex items-start h-[calc(100vh-90px)]">
        <div
          className={`lg:w-[20%] z-100 bg-black/80 overflow-hidden h-full w-full lg:sticky absolute top-0 transition-all duration-500 lg:rounded-2xl ${isOpen ? "left-0" : "-left-full"
            }`}
        >
          <div className="bg-tertiary lg:w-full md:w-3/5 w-4/5 h-full px-2 py-4 lg:pt-0 pt-3 flex flex-col justify-between ">

            <div className="lg:hidden flex items-center border-b border-b-secondary justify-between p-4 w-full ">

              <img
                src={assets.logo}
                alt="Payfleet Logo"
                className="w-1/3 md:hidden inline"
              />
              {/* Left Navigation */}
              <button
                type="button"
                className="lg:hidden rounded-full block text-textBlack"
                onClick={() => setIsOpen(false)}
              >
                <FaXmark size={21} />
              </button>
            </div>
            <Sidebar setIsOpen={setIsOpen} />
          </div>
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
        {!location.pathname.startsWith("/superadmin") &&
          !location.pathname.startsWith("/admin") &&
          !location.pathname.startsWith("/support") &&
          !location.pathname.startsWith("/financial") && (
            <FloatingContactWidget />
          )}
      </div>
    </div>
  );
};

export default MainLayout;
