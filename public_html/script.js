/* Highlight active page */
(function () {
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
})();

/* Dynamic Highlighting of Contents */
(function () {
  const path = location.pathname.split('/').slice(0, 3).join('/');
  const section = document.querySelector(`.toc .section a[href="${path}"]`);
  if (section) {
    const anchors = document.querySelectorAll('a[name].main, a[id]:has(h2)');
    console.log(anchors);
    let sectionTocHtml = '<ul class="subsection">';
    for (const a of anchors) {
      sectionTocHtml += `<li><a href="#${a.name || a.id}">${a.name ? a.nextElementSibling.innerText : a.innerText}</a></li>`;
    }
    sectionTocHtml += '</ul>';

    section.parentNode.innerHTML += sectionTocHtml;

    const links = document.querySelectorAll('.subsection li a');
    if (anchors.length !== links.length)
      throw new Error('Link mismatch');
    let activeLink;
    const offset = document.querySelector('.topbar').offsetHeight;
    const scrollingElement = document.querySelector('.content-container');
    function setActiveSubsection () {
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
})();

/* Copy Buttons on Code Examples */
(function () {
  const codes = document.querySelectorAll('pre code');
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const copy = document.createElement('button');
    copy.className = 'copy';
    copy.addEventListener('click', function () {
      copyToClipboard(code.innerHTML.replace(/<span class="(keyword|string|comment|number)">|<\/span>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<'));
    });
    code.parentNode.parentNode.insertBefore(copy, code.parentNode.nextSibling);
  }

  function copyToClipboard (text) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  // TODO
  function runInSandbox (text) {
  }
})();

/* Mobile menu button */
(function () {
  const sidebar = document.querySelector('.sidebar');
  document.querySelector('.mobile-menu').addEventListener('click', function () {
    if (sidebar.className === 'sidebar')
      sidebar.className = 'sidebar open';
    else
      sidebar.className = 'sidebar';
  });
})();
