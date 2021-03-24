import marked from 'marked';
import jsdom from 'jsdom';
import { promisify } from 'util';
import { readFile as _readFile, writeFile as _writeFile } from 'fs';
const readFile = promisify(_readFile), writeFile = promisify(_writeFile);
const { JSDOM } = jsdom;

const github = 'https://github.com/jspm/jspm.org/blob/master';
const templatePromise = readFile('./template.html');

async function generatePage (name, { title, description, nextSection, prevSection, edit }, sitemap) {
  const source = (await readFile((name || 'index') + '.md')).toString();
  const html = marked(source, { breaks: true, headerIds: false });

  const className = name.replace(/\//g, '-');

  const dom = new JSDOM((await templatePromise).toString());
  const document = dom.window.document;
  document.title = `${title} - jspm.org`;

  {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'twitter:card');
    meta.content = 'summary_large_image';
    document.head.insertBefore(meta, document.head.firstChild);
  }
  {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:url');
    meta.content = 'https://jspm.org/' + (name || 'index');
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
    meta.content = 'https://jspm.org/jspm.png';
    document.head.insertBefore(meta, document.head.firstChild);
  }
  {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:title');
    meta.content = 'jspm.org - ' + title;
    document.head.insertBefore(meta, document.head.firstChild);
  }

  const body = document.body;
  body.className = `page-${className}`;
  body.querySelector('.content').innerHTML = html;
  
  // Get all the primary headings
  const headings = body.querySelectorAll('.content h2');
  for (const heading of headings) {
    const slug = heading.textContent.replace(/\s/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-');
    const a = document.createElement('a');
    a.name = slug;
    a.className = 'anchor main';
    heading.parentNode.insertBefore(a, heading);
  }
  for (const subHeading of body.querySelectorAll('.content h3')) {
    const slug = subHeading.textContent.replace(/\s/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-');
    const a = document.createElement('a');
    a.name = slug;
    a.className = 'anchor';
    subHeading.parentNode.insertBefore(a, subHeading);
  }

  const sectionIndex = Object.keys(sitemap).indexOf(name);
  nextSection = nextSection === undefined && Object.keys(sitemap)[sectionIndex + 1];
  prevSection = prevSection === undefined && Object.keys(sitemap)[sectionIndex - 1];

  if (edit !== false) {
    const nextprev = document.createElement('div');
    nextprev.className = 'nextprev';
    nextprev.innerHTML = `<a class="edit" target="_blank" href="${github}/${name || 'index'}.md">Edit</a>`;
    body.querySelector('.content').appendChild(nextprev);

    if (typeof nextSection === 'string') {
      nextprev.innerHTML += `<div class="next"><a href="/${nextSection}">${sitemap[nextSection].title}</a></div>`;
      nextprev.querySelector('.next a').innerHTML += '&nbsp;&#9654;';
    }
    if (typeof prevSection === 'string') {
      nextprev.innerHTML += `<div class="prev"><a href="/${prevSection}">${sitemap[prevSection].title}</a></div>`;
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
    .replace(/^(\s*\/\/.*)/gm, '<span class=comment>$1</span>')
    .replace(/&lt;!--/g, '<span class=comment>&lt;!--')
    .replace(/--&gt;/g, '--></span>')
    .replace(/('[^']*')/gm, '<span class=string>$1</span>')
    .replace(/("[^"]*")/gm, '<span class=string>$1</span>')
    .replace(/([^#\d\-a-z\:])(-?\d+)/gm, '$1<span class=number>$2</span>')
    .replace(/([^\.\-\/"']|^)(for|function|new|await|async|throw|return|var|let|const|if|else|true|as|false|this|import|export class|export|from)([^-a-zA-Z=]|$)/gm, '$1<span class=keyword>$2</span>$3');
  }
  
  // Extract the modified HTML
  const out = `./public_html/${name || 'index'}.html`;
  console.log('Writing ' + out);
  await writeFile(out, dom.serialize());
}

Promise.resolve()
.then(async () => {
  const sitemap = JSON.parse(await readFile('./sitemap.json'));
  await Promise.all(
    Object.keys(sitemap).map(name => generatePage(name, sitemap[name], sitemap))
  );
})
.then(() => {
  console.log('Completed.');
}, err => {
  console.error(err);
});