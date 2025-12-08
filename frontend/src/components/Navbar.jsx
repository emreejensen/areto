import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Trophy, Info, BarChart3, LogIn } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-primary">
          <span className="text-3xl">🎯</span>
          Areto
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/leaderboard" 
              className={isActive('/leaderboard') ? 'active' : ''}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={isActive('/about') ? 'active' : ''}
            >
              <Info className="w-4 h-4" />
              About
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="navbar-end gap-2">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn btn-primary btn-sm gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Mobile Dropdown */}
      <div className="dropdown dropdown-end lg:hidden ml-2">
        <label tabIndex={0} className="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </label>
        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li><Link to="/"><BarChart3 className="w-4 h-4" /> Dashboard</Link></li>
          <li><Link to="/leaderboard"><Trophy className="w-4 h-4" /> Leaderboard</Link></li>
          <li><Link to="/about"><Info className="w-4 h-4" /> About</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;