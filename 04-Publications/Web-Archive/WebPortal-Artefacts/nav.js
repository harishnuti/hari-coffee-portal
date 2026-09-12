// nav.js — Shared Navigation Component for Hari's Coffee Archive
// Injects sticky premium nav bar into any page. Pure JS, no dependencies.
// Usage: Add <script src="nav.js"></script> before </body> in every HTML file.

document.addEventListener('DOMContentLoaded', () => {
  // Inject nav CSS (ensures consistent styling across all pages)
  const style = document.createElement('style');
  style.textContent = `
    .coffee-nav {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0d0d0d;
      height: 56px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 28px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      color: #c9a84c;
      font-weight: 700;
      font-size: 1.35rem;
      text-decoration: none;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: transform 0.2s ease;
    }
    .logo:hover {
      transform: scale(1.02);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 36px;
    }
    .nav-links a {
      color: #f5f5f5;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.01em;
      transition: color 0.25s ease, transform 0.2s ease;
      position: relative;
    }
    .nav-links a:hover {
      color: #c9a84c;
    }
    .nav-links a.active {
      color: #c9a84c;
      font-weight: 600;
    }
    .nav-links a.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #c9a84c;
      border-radius: 2px;
    }
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      cursor: pointer;
      gap: 5px;
      padding: 0;
    }
    .hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: #c9a84c;
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hamburger.active span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }
    .hamburger.active span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
    @media (max-width: 900px) {
      .nav-links {
        display: none;
        position: absolute;
        top: 56px;
        left: 0;
        right: 0;
        background: #0d0d0d;
        flex-direction: column;
        padding: 24px 28px;
        gap: 18px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        border-top: 1px solid #2a2a2a;
      }
      .nav-links.active {
        display: flex;
      }
      .hamburger {
        display: flex;
      }
    }
  `;
  document.head.appendChild(style);

  // Create nav element
  const nav = document.createElement('nav');
  nav.className = 'coffee-nav';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.innerHTML = `
    <div class="nav-container">
      <a href="index.html" class="logo" aria-label="Hari Coffee Archive home">
        ☕ <span>Hari Coffee Archive</span>
      </a>
      
      <div class="nav-links" id="nav-links">
        <a href="archive.html" data-page="archive">Archive</a>
        <a href="singapore.html" data-page="singapore">Singapore</a>
        <a href="encyclopedia.html" data-page="encyclopedia">Encyclopedia</a>
        <a href="roasters.html" data-page="roasters">Roasters</a>
        <a href="report.html" data-page="report">Report</a>
        <a href="gallery.html" data-page="gallery">Gallery</a>
      </div>
      
      <button class="hamburger" id="hamburger" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  `;

  // Insert nav at the very top of body
  document.body.insertBefore(nav, document.body.firstChild);

  // Highlight active page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinksContainer = nav.querySelector('#nav-links');
  const links = navLinksContainer.querySelectorAll('a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
    // Close mobile menu on link click
    link.addEventListener('click', () => {
      navLinksContainer.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Hamburger menu functionality
  const hamburger = nav.querySelector('#hamburger');
  hamburger.addEventListener('click', () => {
    const isActive = navLinksContainer.classList.toggle('active');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });

  // Close menu when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navLinksContainer.classList.contains('active')) {
      navLinksContainer.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Keyboard accessibility for hamburger
  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isActive = navLinksContainer.classList.toggle('active');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    }
  });
});
