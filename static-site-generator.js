Chomp.addExtension('chomp@0.1:npm');

Chomp.registerTemplate('static-site-generator', function (task) {
  if (task.run || task.engine)
    throw new Error('Static site generator template does not expect a run or engine field.');
  const { template, siteUrl, siteName, siteImage, editUrl, autoInstall } = task.templateOptions;
  if (!template)
    throw new Error('Static site generator requires the "template" option to be set to an HTML template file.');
  if (!siteUrl)
    throw new Error('Static site generator requires the "site-url" option to be set to a the URL of the site.');
  if (!siteName)
    throw new Error('Static site generator requires the "site-name" option to be set to a title name for the site.');
  if (!siteImage)
    throw new Error('Static site generator requires the "site-image" option to be set to an image URL for the site.');
  const interpolationDep = task.deps.find(dep => dep.indexOf('#') !== -1);
  const interpolationTarget = task.targets.find(target => target.indexOf('#') !== -1);
  if (!interpolationDep || !interpolationTarget)
    throw new Error('Static site generator requires an interpolation target and dep.');
  return [{
    name: task.name,
    deps: [...task.deps, ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/marked', 'node_modules/jsdom', 'node_modules/@ltd/j-toml']],
    targets: task.targets,
    engine: 'node',
    run: `    import marked from 'marked';
    import jsdom from 'jsdom';
    import toml from '@ltd/j-toml';
    import { readFile, writeFile } from 'fs/promises';
    const { JSDOM } = jsdom;

    async function readMarkdown (path) {
      let source = await readFile(path, 'utf8');
      const metadataEndIndex = source.startsWith('+++') && (source.match(/\\r?\\n\\+\\+\\+/)?.index || -1);
      const metadata = metadataEndIndex !== -1 ? toml.parse(source.slice(3, metadataEndIndex)) : {};
      if (metadataEndIndex !== -1)
        source = source.slice(metadataEndIndex + (source[metadataEndIndex] === '\\r' ? 5 : 4));
      const html = marked(source, { breaks: true, headerIds: false });
      return { html, metadata };
    }
    
    const name = process.env.MATCH;

    const { html, metadata } = await readMarkdown(process.env.DEP);
    const { title, description, 'next-section': nextSection, 'prev-section': prevSection, edit } = metadata;

    let nextSectionTitle, prevSectionTitle;
    if (nextSection)
      nextSectionTitle = (await readMarkdown(${JSON.stringify(interpolationDep)}.replace('#', nextSection))).metadata.title;
    if (prevSection)
      prevSectionTitle = (await readMarkdown(${JSON.stringify(interpolationDep)}.replace('#', prevSection))).metadata.title;
  
    const className = name.replace(/\\//g, '-');

    const template = await readFile(${JSON.stringify(template)}, 'utf8');
    const dom = new JSDOM(template);
    const document = dom.window.document;
    document.title = \`\${title} - ${siteName}\`;

    {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'twitter:card');
      meta.content = 'summary_large_image';
      document.head.insertBefore(meta, document.head.firstChild);
    }
    {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      meta.content = ${JSON.stringify(siteUrl)} + (name === 'index' ? '' : name);
      document.head.insertBefore(meta, document.head.firstChild);
    }
    {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = description;
      document.head.insertBefore(meta, document.head.firstChild);
    }
    {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'Description');
      meta.content = description;
      document.head.insertBefore(meta, document.head.firstChild);
    }
    {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.content = ${JSON.stringify(siteImage)};
      document.head.insertBefore(meta, document.head.firstChild);
    }
    {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = '${siteName} - ' + title;
      document.head.insertBefore(meta, document.head.firstChild);
    }

    const body = document.body;
    body.className = \`page-\${className}\`;
    body.querySelector('.content').innerHTML = html;
    
    // Get all the primary headings
    const headings = body.querySelectorAll('.content h2');
    for (const heading of headings) {
      const slug = heading.textContent.replace(/\\s/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-');
      const a = document.createElement('a');
      a.name = slug;
      a.className = 'anchor main';
      heading.parentNode.insertBefore(a, heading);
    }
    for (const subHeading of body.querySelectorAll('.content h3')) {
      const slug = subHeading.textContent.replace(/\\s/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-');
      const a = document.createElement('a');
      a.name = slug;
      a.className = 'anchor';
      subHeading.parentNode.insertBefore(a, subHeading);
    }

    if (edit !== false) {
      const nextprev = document.createElement('div');
      nextprev.className = 'nextprev';
      nextprev.innerHTML = \`<a class="edit" target="_blank" href="${editUrl}/\${name || 'index'}.md">Edit</a>\`;
      body.querySelector('.content').appendChild(nextprev);

      if (typeof nextSection === 'string') {
        nextprev.innerHTML += \`<div class="next"><a href="/\${nextSection}">\${nextSectionTitle}</a></div>\`;
        nextprev.querySelector('.next a').innerHTML += '&nbsp;&#9654;';
      }
      if (typeof prevSection === 'string') {
        nextprev.innerHTML += \`<div class="prev"><a href="/\${prevSection}">\${prevSectionTitle}</a></div>\`;
        nextprev.querySelector('.prev a').innerHTML = '&#9664;&nbsp;' + nextprev.querySelector('.prev a').innerHTML;
      }
    }
    
    // make all external links open in a new window
    body.querySelectorAll('a').forEach(x => {
      try { new URL(x.href) }
      catch { return }
      if (x.href.startsWith('about:blank'))
        return;
      x.target = '_blank';
    });
    
    // add rel=noopener to all target=blank links
    body.querySelectorAll('a[target]').forEach(x => x.rel = 'noopener');

    /* Super Lazy Syntax Highlighting */
    const langs = body.querySelectorAll('code');
    for (let i = 0; i < langs.length; i++) {
      const code = langs[i];
      code.innerHTML = code.innerHTML
      .replace(/^(\\s*\\/\\/.*)/gm, '<span class=comment>$1</span>')
      .replace(/&lt;!--/g, '<span class=comment>&lt;!--')
      .replace(/--&gt;/g, '--></span>')
      .replace(/('[^']*')/gm, '<span class=string>$1</span>')
      .replace(/("[^"]*")/gm, '<span class=string>$1</span>')
      .replace(/([^#\\d\\-a-z\\:])(-?\\d+)/gm, '$1<span class=number>$2</span>')
      .replace(/([^\\.\\-\\/"']|^)(for|function|new|await|async|throw|return|var|let|const|if|else|true|as|false|this|import|export class|export|from)([^-a-zA-Z=]|$)/gm, '$1<span class=keyword>$2</span>$3');
    }

    await writeFile(process.env.TARGET, dom.serialize());
`
  }, ...ENV.CHOMP_EJECT ? [] : [{
    template: 'npm',
    templateOptions: {
      autoInstall,
      packages: ['marked', 'jsdom', '@ltd/j-toml'],
      dev: true
    }
  }]]
});
