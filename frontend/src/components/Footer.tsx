import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto py-4">
      <div className="w-full text-center text-sm text-gray-500">
        <p>&copy; {currentYear} EzGestor. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;