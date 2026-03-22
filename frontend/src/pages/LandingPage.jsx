import { NavLink } from "react-router-dom";
import {
  Camera,
  Users,
  Shield,
  BarChart3,
  Clock,
  Building2,
  GraduationCap,
  Factory,
  Landmark,
  Laptop
} from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: Camera,
      title: "AI Face Recognition",
      desc: "Accurate real-time facial recognition optimized for attendance systems."
    },
    {
      icon: Clock,
      title: "Automated Attendance",
      desc: "Seamless clock-in and clock-out with precise timestamps."
    },
    {
      icon: Users,
      title: "Multi-User Support",
      desc: "Handle classrooms, teams, and enterprises at scale."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      desc: "Clear attendance insights with export-ready reports."
    },
    {
      icon: Shield,
      title: "Secure by Design",
      desc: "Role-based access, encrypted data, and audit-ready logs."
    }
  ];

  const industries = [
    { icon: GraduationCap, name: "Education" },
    { icon: Building2, name: "Corporate" },
    { icon: Factory, name: "Manufacturing" },
    { icon: Landmark, name: "Government" },
    { icon: Laptop, name: "Remote Teams" }
  ];

  return (
    <div className="bg-slate-950 text-white">
      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 py-28 text-center">
        <Camera className="w-16 h-16 mx-auto text-cyan-400 mb-6" />

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          AI-Powered Face Recognition Attendance System
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          A secure and scalable face recognition platform for modern
          classrooms and enterprises.
        </p>

        <div className="flex justify-center gap-4">
          <NavLink to="/classrooms">
            <button className="px-8 py-3 bg-cyan-600 cursor-pointer hover:bg-cyan-700 rounded-md font-semibold transition">
              Enter Application
            </button>
          </NavLink>

          <button className="px-8 py-3 cursor-pointer border border-white/20 rounded-md text-gray-300 hover:bg-white/5 transition">
            View Demo
          </button>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            Core Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-white/10 rounded-xl p-6"
              >
                <f.icon className="w-10 h-10 text-cyan-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "99.9%", label: "Accuracy" },
            { value: "<0.5s", label: "Processing Time" },
            { value: "500K+", label: "Users" },
            { value: "1200+", label: "Organizations" }
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-bold text-cyan-400">
                {s.value}
              </div>
              <div className="text-gray-400 mt-1 text-sm">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= INDUSTRIES ================= */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Trusted Across Industries
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {industries.map((ind, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-white/10 rounded-xl p-6"
              >
                <ind.icon className="w-8 h-8 mx-auto text-cyan-400 mb-3" />
                <p className="text-sm font-medium">
                  {ind.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Start Managing Attendance Smarter
        </h2>

        <p className="text-gray-400 mb-10 max-w-xl mx-auto">
          Deploy AI-powered attendance in minutes. No complex setup.
        </p>

        <NavLink to="/classrooms">
          <button className="px-10 py-4 cursor-pointer bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold transition">
            Get Started
          </button>
        </NavLink>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 py-10 text-center text-gray-400 text-sm">
        © 2024 FaceAttend AI. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
