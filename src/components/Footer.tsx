
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} PDF Saga. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
