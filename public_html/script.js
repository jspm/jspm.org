/* Ensure dark mode consistency */
(function() {
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  // Apply theme class immediately to prevent flash
  if (isDark) {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');
    document.documentElement.style.setProperty('color-scheme', 'dark');
  }
})();

/* Highlight active page */
document.addEventListener('DOMContentLoaded', function() {
  const path = location.pathname.split('/').slice(0, 3).join('/');
  for (const a of document.querySelectorAll('a[href]')) {
    if (a.hostname !== location.hostname) {
      if (!a.hasAttribute('target')) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
      continue;
    }
    if (a.pathname === path) a.className += ' active';
  }
  
  /* Dynamic Highlighting of Contents */
  const section = document.querySelector(`.toc .section a[href="${path}"]`);
  if (section) {
    let anchors = [...document.querySelectorAll('a[name].main, a[id]')];
    anchors = anchors.filter(a => {
      return a.hasAttribute('name') && a.className.includes('main') || [...a.childNodes].some(node => node.tagName === 'H2');
    });
    let sectionTocHtml = '<ul class="subsection">';
    for (const a of anchors) {
      sectionTocHtml += `<li><a href="#${a.name || a.id}">${a.name ? a.nextElementSibling.innerText : a.innerText}</a></li>`;
    }
    sectionTocHtml += '</ul>';

    section.parentNode.innerHTML += sectionTocHtml;

    const links = document.querySelectorAll('.subsection li a');
    if (anchors.length !== links.length)
      console.warn('Link mismatch in subsection navigation');
    
    let activeLink;
    const offset = document.querySelector('.topbar').offsetHeight;
    const scrollingElement = document.querySelector('.content-container');
    
    function setActiveSubsection() {
      const scrollTop = scrollingElement.scrollTop;
      let linkMatch;
      for (let i = 0; i < anchors.length; i++) {
        const anchor = anchors[i];
        if (scrollTop + offset < anchor.nextElementSibling.offsetTop - anchor.nextElementSibling.offsetHeight) {
          linkMatch = links[i === 0 ? 0 : i - 1];
          break;
        }
      }
      if (!linkMatch || scrollTop > (scrollingElement.scrollHeight - scrollingElement.clientHeight - 20)) {
        linkMatch = links[anchors.length - 1];
      }
      if (linkMatch !== activeLink) {
        if (activeLink)
          activeLink.className = '';
        if (linkMatch)
          linkMatch.className = 'active';
        activeLink = linkMatch;
      }
    }
    
    scrollingElement.addEventListener('scroll', setActiveSubsection);
    setActiveSubsection();
  }
  
  /* Copy Buttons on Code Examples */
  const codes = document.querySelectorAll('pre code');
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const copy = document.createElement('button');
    copy.className = 'copy';
    copy.setAttribute('title', 'Copy to clipboard');
    copy.setAttribute('aria-label', 'Copy code to clipboard');
    
    copy.addEventListener('click', function() {
      // Modern clipboard API
      if (navigator.clipboard) {
        const cleanCode = code.textContent
          .replace(/^\n+|\n+$/g, '') // Trim leading/trailing newlines
          .replace(/<span class="[a-zA-Z-_0-9]+">|<\/span>/g, '') // Remove spans
          .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&'); // HTML entities
        
        navigator.clipboard.writeText(cleanCode).then(() => {
          // Visual feedback
          copy.style.opacity = '1';
          copy.style.backgroundColor = 'var(--primary-light)';
          
          setTimeout(() => {
            copy.style.opacity = '';
            copy.style.backgroundColor = '';
          }, 700);
        });
      } else {
        // Fallback for older browsers
        const el = document.createElement('textarea');
        el.value = code.textContent
          .replace(/^\n+|\n+$/g, '')
          .replace(/<span class="[a-zA-Z-_0-9]+">|<\/span>/g, '')
          .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
    });
    
    const preElement = code.parentNode;
    preElement.style.position = 'relative';
    preElement.appendChild(copy);
  }
  
  /* Mobile menu button */
  const sidebar = document.querySelector('.sidebar');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking on a link in mobile view
    document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
        }
      });
    });
    
    // Close sidebar when clicking outside of it
    document.addEventListener('click', function(event) {
      if (window.innerWidth <= 768 && 
          !sidebar.contains(event.target) && 
          !mobileMenu.contains(event.target) && 
          sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  }
  
  /* Light/Dark mode toggle */
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    // Check for saved theme preference, otherwise use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    // Function to set theme
    function setTheme(isDark, useSystemPreference = false) {
      // Toggle classes for theme
      document.body.classList.toggle('dark-mode', isDark);
      document.documentElement.classList.toggle('dark-mode', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      
      // Only set localStorage if NOT using system preference
      if (useSystemPreference) {
        localStorage.removeItem('theme'); // Remove the setting to follow system
      } else {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      }
      
      // Remove any inline dark mode styles that were added on page load
      if (!isDark) {
        // Get all style elements added by the initial dark mode script
        const inlineStyles = document.head.querySelector('style:not([href])');
        if (inlineStyles && inlineStyles.textContent.includes('background-color:#1A202C!important')) {
          inlineStyles.remove();
        }
        // Reset any important background/color styles
        document.documentElement.style.removeProperty('background-color');
        document.body.style.removeProperty('background-color');
        document.body.style.removeProperty('color');
      }
    }
    
    // Initialize theme
    if (savedTheme) {
      setTheme(savedTheme === 'dark', false);
    } else {
      setTheme(prefersDark.matches, true);
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
      const currentlyDark = document.body.classList.contains('dark-mode');
      const matchesSystem = (currentlyDark === prefersDark.matches);
      
      // If current theme matches system preference after clicking,
      // we should use system preference (remove from localStorage)
      setTheme(!currentlyDark, !currentlyDark === prefersDark.matches);
    });
    
    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches, true);
      }
    });
  }
  
  /* Fade animations removed */
});