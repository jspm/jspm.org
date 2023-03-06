Chomp.addExtension('chomp@0.1:npm');

const READ_MARKDOWN = `async function readMarkdown (path) {
  let source = await readFile(path, 'utf8');
  const metadataEndIndex = source.startsWith('+++') && (source.match(/\\r?\\n\\+\\+\\+/)?.index || -1);
  const metadata = metadataEndIndex !== -1 ? toml.parse(source.slice(3, metadataEndIndex)) : {};
  if (metadataEndIndex !== -1)
    source = source.slice(metadataEndIndex + (source[metadataEndIndex] === '\\r' ? 5 : 4));
  const html = marked.marked(source, { breaks: true, headerIds: false });
  return { html, metadata };
}`;

const GET_SLUG = `const getSlug = name => name.replace(/\\s/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-');`

Chomp.registerTemplate('static-site-generator', function (task) {
  if (task.run || task.engine || task.targets.length || task.deps.length)
    throw new Error('Static site generator template does not expect a run, deps, target or engine field.');
  const { template, pages, publicHtml, siteUrl, siteName, siteImage, editUrl, feed, feedExclude = [], autoInstall } = task.templateOptions;
  if (!template)
    throw new Error('Static site generator requires the "template" option to be set to an HTML template file.');
  if (!siteUrl)
    throw new Error('Static site generator requires the "site-url" option to be set to a the URL of the site.');
  if (!siteName)
    throw new Error('Static site generator requires the "site-name" option to be set to a title name for the site.');
  if (!siteImage)
    throw new Error('Static site generator requires the "site-image" option to be set to an image URL for the site.');
  if (!pages)
    throw new Error('Static site generator requires the "pages" option to be set to for the folder of markdown files for the site.');
  if (!publicHtml)
    throw new Error('Static site generator requires the "public_html" option to be set for the static output.');
  feedExclude.push('node_modules/');
  return [{
    name: task.name,
    deps: [`${pages}/##.md`, template, ...feed ? [`${publicHtml}/${feed}`] : [], ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/marked', 'node_modules/jsdom', 'node_modules/@ltd/j-toml']],
    target: `${publicHtml}/##.html`,
    engine: 'node',
    run: `    import * as marked from 'marked';
    import jsdom from 'jsdom';
    import toml from '@ltd/j-toml';
    import { readFile, writeFile } from 'fs/promises';
    const { JSDOM } = jsdom;

    ${READ_MARKDOWN}
    ${GET_SLUG}
    
    const name = process.env.MATCH;

    const { html, metadata } = await readMarkdown(process.env.DEP);
    const { title, description, 'next-section': nextSection, 'prev-section': prevSection, edit } = metadata;

    let nextSectionTitle, prevSectionTitle;
    if (nextSection)
      nextSectionTitle = (await readMarkdown(\`${pages}/\${nextSection}.md\`)).metadata.title;
    if (prevSection)
      prevSectionTitle = (await readMarkdown(\`${pages}/\${prevSection}.md\`)).metadata.title;

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
    }${feed ? `
    {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('title', ${JSON.stringify(siteName)});
      link.setAttribute('type', 'application/json');
      link.setAttribute('href', ${JSON.stringify(`${siteUrl}${feed}`)});
      document.head.insertBefore(link, document.head.firstChild);
    }` : ''}

    const body = document.body;
    body.className = \`page-\${className}\`;
    body.querySelector('.content').innerHTML = html;
    
    // Get all the primary headings
    const headings = body.querySelectorAll('.content h2');
    for (const heading of headings) {
      const slug = getSlug(heading.textContent);
      const a = document.createElement('a');
      a.name = slug;
      a.className = 'anchor main';
      heading.parentNode.insertBefore(a, heading);
    }
    for (const subHeading of body.querySelectorAll('.content h3')) {
      const slug = getSlug(subHeading.textContent);
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
      .replace(/'''([\\s\\S]+)'''/g, '<span class=string>\\'\\'\\'$1\\'\\'\\'</span>')
      .replace(/"""([\\s\\S]+)"""/g, '<span class=string>"""$1"""</span>')
      .replace(/^(\\s*\\/\\/.*)/gm, '<span class=comment>$1</span>')
      .replace(/&lt;!--/g, '<span class=comment>&lt;!--')
      .replace(/--&gt;/g, '--></span>')
      .replace(/('[^']*')/gm, '<span class=string>$1</span>')
      .replace(/("[^"]*")/gm, '<span class=string>$1</span>')
      .replace(/(\`[^\`]*\`)/gm, '<span class=string>$1</span>')
      .replace(/([^#\\d\\-a-z\\:])(-?\\d+)/gm, '$1<span class=number>$2</span>')
      .replace(/([^\\.\\-\\/"']|^)(for|function|new|await|async|throw|return|var|let|const|if|else|true|as|false|this|import|export class|export|from)([^-a-zA-Z=]|$)/gm, '$1<span class=keyword>$2</span>$3');
    }

    await writeFile(process.env.TARGET, dom.serialize());
`
  }, ...feed ? [{
    target: `${publicHtml}/${feed}`,
    deps: [`${pages}/**/*.md`, ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/marked', 'node_modules/@ltd/j-toml']],
    engine: 'node',
    run: `    import * as marked from 'marked';
      import toml from '@ltd/j-toml';
      import { readFile, writeFile, stat } from 'fs/promises';
      import { basename, extname } from 'path';

      ${READ_MARKDOWN}
      ${GET_SLUG}

      // existing feed loaded to maintain publish dates and ids
      let existingFeedItems;
      try {
        ({ items: existingFeedItems } = JSON.parse(await readFile(process.env.TARGET, 'utf8')));
      }
      catch {}

      const feed = {
        version: 'https://jsonfeed.org/version/1',
        title: ${JSON.stringify(siteName)},
        home_page_url: ${JSON.stringify(siteUrl)},
        feed_url: ${JSON.stringify(`${siteUrl}/${feed}`)},
        items: []
      };

      const feedExclude = ${JSON.stringify(feedExclude)};
      const deps = process.env.DEPS.split(':').filter(dep =>
        feedExclude.every(exclude => dep !== exclude && !(exclude.endsWith('/') && dep.startsWith(exclude)))
      );
      const items = await Promise.all(deps.map(async dep => {
        const stats = await stat(dep);
        const { metadata } = await readMarkdown(dep);
        const url = \`${siteUrl}\${dep.slice(${pages.length + 1}, -3)}\`;
        const existingItem = existingFeedItems.find(item => item.url === url);
        return {
          id: existingItem?.id ?? null,
          url,
          title: metadata.title,
          content_html: \`<p>\${metadata.description}</p>\`,
          date_published: existingItem?.date_published ?? stats.mtime,
          date_modified: stats.mtime
        };
      }));
      items.sort((a, b) =>
        new Date(a.date_published).getTime() > new Date(b.date_published).getTime() ? -1 : 1
      );
      let curId = 0;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.id) {
          item.id = String(item.id);
          curId = Number(item.id);
        }
        else {
          item.id = String(++curId);
        }
      }
      feed.items = items;

      writeFile(process.env.TARGET, JSON.stringify(feed, null, 2));
    `
  }] : [], ...ENV.CHOMP_EJECT ? [] : [{
    template: 'npm',
    templateOptions: {
      autoInstall,
      packages: ['marked', 'jsdom', '@ltd/j-toml'],
      dev: true
    }
  }]]
});
