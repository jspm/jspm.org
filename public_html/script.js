/* Dynamic Highlighting of Contents */
(function () {
  const anchors = document.querySelectorAll('a[name]');
  const links = document.querySelectorAll('.active .subsection li a');
  if (anchors.length !== links.length)
    throw new Error('Link mismatch');
  let activeLink;
  const offset = document.querySelector('.topbar').offsetHeight;
  function setActiveSubsection () {
    const scrollTop = document.body.scrollTop;
    let linkMatch;
    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      if (scrollTop + offset < anchor.nextSibling.offsetTop - anchor.nextSibling.offsetHeight) {
        linkMatch = links[i === 0 ? 0 : i - 1];
        break;
      }
    }
    if (!linkMatch || scrollTop > (document.body.scrollHeight - document.body.clientHeight)) {
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
  window.addEventListener('scroll', setActiveSubsection);
  setActiveSubsection();
})();

/* Copy Buttons on Code Examples */
(function () {
  const codes = document.querySelectorAll('pre code');
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const copy = document.createElement('button');
    copy.className = 'copy';
    copy.addEventListener('click', function () {
      copyToClipboard(code.innerHTML);
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
})();
