    import { Home, Handshake, ClipboardList, BarChart, Settings, Store, Users, PartyPopper, Globe, Megaphone, Youtube} from "lucide-react";
    import { NavLink } from "react-router-dom";

    export default function AdminSidebar() {
    return (
      <aside className="w-70 h-screen bg-white shadow-lg flex flex-col">
        {/* Logo / Brand */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-green-700">CleanoFresh</h2>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 p-4 space-y-2">
          <NavLink
            to="/admin/admindashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <Home size={20} /> <span className="text-sm">Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/admincrm"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <Handshake size={20} /> <span className="text-sm">CRM</span>
          </NavLink>

          <NavLink
            to="/admin/adminservicesbookings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <ClipboardList size={20} />{" "}
            <span className="text-sm">Services & Bookings</span>
          </NavLink>

          <NavLink
            to="/admin/adminecommerce"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <Store size={20} /> <span className="text-sm">E-Commerce</span>
          </NavLink>

          <NavLink
            to="/admin/adminpeopleorganizations"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <Users size={20} />
            <span className="text-sm">People & Organizations</span>
          </NavLink>

          <NavLink
            to="/admin/adminevents"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <PartyPopper size={20} /> <span className="text-sm">Events</span>
          </NavLink>

          <NavLink
            to="/admin/adminaffiliatesmarketing"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <Globe size={20} />
            <span className="text-sm">Affiliates & Marketing</span>
          </NavLink>

          <NavLink
            to="/admin/admincommunications"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <Megaphone size={20} />{" "}
            <span className="text-sm">Communications</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <BarChart size={20} />{" "}
            <span className="text-sm">Analytics & Reports</span>
          </NavLink>

          <NavLink
            to="/admin/admincontentmedia"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <Youtube size={20} />{" "}
            <span className="text-sm">Content & Media</span>
          </NavLink>

          <NavLink
            to="/admin/adminsettings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`
            }
          >
            <Settings size={20} />{" "}
            <span className="text-sm">System & Security</span>
          </NavLink>
        </nav>

        {/* Footer / Version */}
        <div className="p-4 border-t border-gray-200 text-sm text-gray-500 ">
          © 2025 CleanoFresh
        </div>
      </aside>
    );
    }
