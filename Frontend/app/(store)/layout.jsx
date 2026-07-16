import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreProtect from "@/components/layout/StoreProtect";

export default function StoreLayout({ children }) {
  return (
    <StoreProtect>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </StoreProtect>
  );
}
