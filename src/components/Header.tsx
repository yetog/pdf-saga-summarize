
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-200 ease-in-out',
        isScrolled 
          ? 'backdrop-blur-md bg-background/80 border-b border-border/50 py-3' 
          : 'bg-transparent',
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link 
          to="/" 
          className="text-2xl font-medium tracking-tighter transition-opacity hover:opacity-80"
        >
          PDF Saga
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-sm text-foreground/80 transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="text-sm text-foreground/80 transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="text-sm text-foreground/80 transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </nav>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border/50 shadow-lg md:hidden animate-in slide-in-from-top-5">
            <nav className="container mx-auto py-4 px-4 flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-lg text-foreground/80 transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-lg text-foreground/80 transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-lg text-foreground/80 transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
