import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";
import { SiteContentProvider } from "./context/SiteContentContext";

import "lenis/dist/lenis.css";

// Components
import SmoothScroll from "./components/SmoothScroll";
import AccreditationStrip from "./components/AccreditationStrip";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import InquiryModal from "./components/InquiryModal";
import WhatsAppFloating from "./components/WhatsAppFloating";
import SeoManager from "./components/SeoManager";

// Pages
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Workshop from "./pages/Workshop";
import About from "./pages/About";
import TestimonialsPage from "./pages/TestimonialsPage";
import FAQPage from "./pages/FAQPage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import VerifyCertificate from "./pages/VerifyCertificate";
import Enroll from "./pages/Enroll";
import Login from "./pages/Login";
import StudentPortal from "./pages/StudentPortal";
import StaffPortal from "./pages/StaffPortal";
import ActivateAccount from "./pages/ActivateAccount";
import AdminPortal from "./pages/AdminPortal";
import OperationsPanel from "./pages/OperationsPanel";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";

function AppContent() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  const handleOpenDemo = (courseId, courseTitle = "") => {
    setSelectedCourseTitle(courseTitle);
    setDemoModalOpen(true);
  };

  const handleCloseDemo = () => {
    setDemoModalOpen(false);
    setSelectedCourseTitle("");
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 6
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.25,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.12,
        ease: "easeOut"
      }
    }
  };

  const isPortal = location.pathname.startsWith("/admin") || location.pathname.startsWith("/portal") || location.pathname.startsWith("/operations");

  return (
    <>
      <SeoManager />
      {!isPortal && <SmoothScroll isPaused={demoModalOpen} />}
      {/* Subtle animated yellow gradient background */
      <div className="bg-gradient-ambient" />

      <div className="site-wrapper" style={{ position: "relative", zIndex: 1 }}>
        {!isPortal && <AccreditationStrip />}
        {!isPortal && <Navbar onOpenDemo={() => handleOpenDemo("", "")} />}

        <main className={`main-content ${isPortal ? "portal-main-content" : ""}`} style={isPortal ? { padding: 0, margin: 0, maxWidth: "100%" } : undefined}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              style={{ width: "100%" }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home onOpenDemo={handleOpenDemo} />} />
                <Route path="/courses" element={<Courses onOpenDemo={handleOpenDemo} />} />
                <Route path="/course/:slug" element={<CourseDetail onOpenDemo={handleOpenDemo} />} />
                <Route path="/workshop" element={<Workshop onOpenDemo={handleOpenDemo} />} />
                <Route path="/about" element={<About onOpenDemo={handleOpenDemo} />} />
                <Route path="/testimonials" element={<TestimonialsPage onOpenDemo={handleOpenDemo} />} />
                <Route path="/placements" element={<Navigate to="/testimonials" replace />} />
                <Route path="/faq" element={<FAQPage onOpenDemo={handleOpenDemo} />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost onOpenDemo={handleOpenDemo} />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/verify" element={<VerifyCertificate />} />
                <Route path="/enroll" element={<Enroll />} />
                <Route path="/login" element={<Login />} />
                <Route path="/portal/student" element={<StudentPortal />} />
                <Route path="/portal/staff" element={<StaffPortal />} />
                <Route path="/portal/admin" element={<AdminPortal />} />
                <Route path="/portal/operations" element={<OperationsPanel />} />
                <Route path="/operations" element={<Navigate to={`/portal/operations${location.search}${location.hash}`} replace />} />
                <Route path="/activate/:token" element={<ActivateAccount />} />
                <Route path="/admin" element={<Navigate to={`/portal/admin${location.search}${location.hash}`} replace />} />
                <Route path="/admin/*" element={<Navigate to={`/portal/admin${location.search}${location.hash}`} replace />} />
                <Route path="/page/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/page/terms-conditions" element={<TermsConditions />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

        {!isPortal && <Footer />}
        {!isPortal && <WhatsAppFloating />}

        <InquiryModal
          isOpen={demoModalOpen}
          onClose={handleCloseDemo}
          preselectedCourseTitle={selectedCourseTitle}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SiteContentProvider>
          <AppContent />
        </SiteContentProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
