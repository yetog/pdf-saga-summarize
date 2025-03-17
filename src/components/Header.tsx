
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
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
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        <Link 
          to="/" 
          className="text-2xl font-medium tracking-tighter transition-opacity hover:opacity-80"
        >
          PDF Saga
        </Link>
        
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
      </div>
    </header>
  );
};

export default Header;
