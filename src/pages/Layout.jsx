
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutGrid, TrendingUp } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e9bb481a7_bone_club_trans.png";

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#e5e4cd' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap');
        
        :root {
          --header-bg: #007e81;
          --main-bg: #e5e4cd;
          --heading-color: #5a3217;
          --highlight-color: #f26222;
          --tool-bg: #9fd3ba;
          --text-primary: #5a3217;
        }
        
        .header-gradient {
          background: #007e81;
        }

        .text-bone-color {
          color: #e5e4cd;
        }

        .text-bone-color-faded {
          color: rgba(229, 228, 205, 0.7);
        }

        .hover-text-bone-color:hover {
          color: #e5e4cd;
        }

        .active-nav-bg {
          background-color: rgba(229, 228, 205, 0.15);
        }

        .hover-nav-bg:hover {
          background-color: rgba(229, 228, 205, 0.1);
        }
        
        .highlight-accent {
          background: #f26222;
        }
        
        .tool-card-bg {
          background: #9fd3ba;
        }
        
        .elegant-shadow {
          box-shadow: 0 8px 32px rgba(0, 126, 129, 0.15);
        }
        
        h1, h2 {
          font-family: 'Oswald', sans-serif !important;
          color: #5a3217 !important;
          text-transform: uppercase !important;
        }
        
        .main-text {
          color: #5a3217;
        }
        
        .highlight-text {
          color: #f26222;
        }
      `}</style>
      
      <header className="header-gradient shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="w-1/3 hidden md:block">{/* Spacer for desktop layout */}</div>
            
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="text-center">
                <Link to={createPageUrl("Home")} className="inline-block">
                  <img 
                    src={logoUrl}
                    alt="Bone Club Logo"
                    className="w-64 h-64 object-contain"
                  />
                </Link>
              </div>
            </div>
            
            <nav className="hidden md:flex w-1/3 justify-end space-x-6">
              <Link 
                to={createPageUrl("Home")} 
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover-nav-bg hover-text-bone-color ${
                  location.pathname === createPageUrl("Home") 
                    ? 'active-nav-bg text-bone-color' 
                    : 'text-bone-color-faded'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="uppercase">Tools</span>
              </Link>
              
              <Link 
                to={createPageUrl("Stats")} 
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover-nav-bg hover-text-bone-color ${
                  location.pathname === createPageUrl("Stats") 
                    ? 'active-nav-bg text-bone-color' 
                    : 'text-bone-color-faded'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="uppercase">Statistics</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer style={{ backgroundColor: '#007e81' }} className="border-t border-gray-600 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-bone-color">
          <p>© 2024 Bone Club. Master the art of backgammon.</p>
        </div>
      </footer>
    </div>
  );
}
