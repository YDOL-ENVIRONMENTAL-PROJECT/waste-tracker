import Header from "@/components/layout/Header";
import AdminSidebar from "@/components/layout/navigation/AdminSidebar";
import ClientSidebar from "@/components/layout/navigation/ClientSidebar";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({ children }) {

  const user = {
    name: "Fongang",
    surname: "Bryan",
    email: "fongang.bryan@gmail.com",
    site: "Centre Collecte Yaoundé",
    city: "Yaoundé",
    phone: "655 143 266",
    role: "SUPER_ADMIN"
  };

  const getSidebar = () => {
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return <AdminSidebar role={user.role} />;
    } else {
      return <ClientSidebar />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      <aside className="h-screen sticky top-0 overflow-y-auto">
        {getSidebar()}
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">

        <header className="sticky top-0 z-10 w-full">
          <Header user={user} />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>

        <Footer />

      </div>

    </div>
  );
}