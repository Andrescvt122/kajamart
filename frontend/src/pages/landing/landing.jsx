import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import Features from "../../components/Features";
import About from "../../components/About";
import Products from "../../components/Products";
import Testimonials from "../../components/Testimonials";
import Footer from "../../components/Footer";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Header />
        <Features />
        <About />
        <Products />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
