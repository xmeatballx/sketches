const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs').promises;
const chokidar = require('chokidar');
const liveServer = require('live-server');
const { JSDOM } = require('jsdom');

const PORT = 8080;
const SRC_DIR = 'src';
const SKETCH_DIR = `${SRC_DIR}/sketches`;
const OUT_DIR = argv.dev ? 'tmp' : 'dist';

async function main() {
  const sketchDir = await fs.opendir(`./${SKETCH_DIR}`);
  const categories = await getCategories(sketchDir);
  const indexHtml = await compileIndex(categories);
  const sketches = await compileSketches(categories);
  await outputFiles(indexHtml, sketches);
}
main();

if (argv.dev) {
  console.log(`Starting dev mode on http://localhost:${PORT}...`);
  
  const watcher = chokidar.watch('src', {
    ignored: /node_modules|dist|\.(git|DS_Store)/, 
    persistent: true,
    ignoreInitial: true,
    atomic: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  });
  
  watcher.on('ready', () => {
    console.log(`Watching for file changes in ${process.cwd()}/${SRC_DIR}...`);
  });
  
  watcher.on('all', (event) => {
    if (event === 'change' || event === 'add') {
      console.log('Rebuilding...');
      main();
      console.log("Rebuilt");
    }
  });
  
  watcher.on('error', error => console.error('Watcher error:', error));
  
  liveServer.start({ root: `./${OUT_DIR}`, port: 8080, logLevel: 0, open: false });

  process.on('SIGINT', () => {
    fs.rm(OUT_DIR, { recursive: true, force: true }).then(() => {
      console.log('Cleanup complete.');
      process.exit(0);
    });
  });
  
}

async function compileIndex(categories) {
  const template = await fs.readFile(`${SRC_DIR}/index.template.html`, { encoding: 'utf-8' });
  const links = await getLinkLists(categories);
  return template.replace('{{ links }}', links);
}

async function getCategories(dir) {
  let categories = [];
  for await (dirent of dir) {
    if (dirent.isDirectory()) {
      const path = getDirentPath(dirent);
      let files = await fs.readdir(path);
      categories.push({
        name: dirent.name,
        files
      });
    }
  }
  return categories;
}

function getDirentPath(dirent) {
  return dirent.parentPath+'/'+dirent.name;
}


async function compileSketches(categories) {
  const template = await fs.readFile(`${SRC_DIR}/sketches/template.html`, { encoding: 'utf-8' });
  let pages = [];
  for await (category of categories) {
    for await (file of category.files) {
      const path = `${SKETCH_DIR}/${category.name}/${file}`;
      const page = await compileSketch(template, path);
      pages.push({
        name: file,
        html: page
      });
    }
  }
  return pages;
}

async function compileSketch(template, path) {
  const sketch = await fs.readFile(path, { encoding: 'utf-8' });
  const dom = new JSDOM(sketch);
  const { DOMParser } = dom.window;
  const parser = new DOMParser();
  const doc = parser.parseFromString(sketch, 'text/html');

  const title = getDisplayNameFromHTMLFileName(path);
  const styles = doc.querySelector('style')?.outerHTML ?? '';
  const libs = doc.querySelectorAll('script[data-head]');
  const libScripts = [...libs].reduce((acc, curr) => {
    return acc + curr.outerHTML;
  }, '');
  const image = doc.querySelector('#img')?.outerHTML ?? ''; 
  const controls = doc.querySelector('#controls')?.outerHTML ?? '';
  const sketchScript = doc.querySelector('script#sketch')?.outerHTML;

  const html = template
    .replace('{{ title }}', title.displayName)
    .replace('{{ style }}', styles)
    .replace('{{ libs }}', libScripts)
    .replace('{{ image }}', image)
    .replace('{{ controls }}', controls)
    .replace('{{ sketch }}', sketchScript);
  return html;
}

async function outputFiles(index, sketches) {
  const exists = await checkDirExists(OUT_DIR);
  if (exists) await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR);
  await fs.cp(`${SRC_DIR}/lib`, `${OUT_DIR}/lib`, { recursive: true });
  await fs.cp(`${SRC_DIR}/assets`, `${OUT_DIR}/assets`, { recursive: true });
  await fs.cp(`${SRC_DIR}/style.css`, `${OUT_DIR}/style.css`);
  await fs.writeFile(`./${OUT_DIR}/index.html`, index, { encoding: 'utf-8' });
  for await (sketch of sketches) {
    await fs.writeFile(`./${OUT_DIR}/${sketch.name}`, sketch.html);
  }
}

async function checkDirExists(path) {
  try {
    await fs.access(path);
    return true;
  }
  catch {
    return false;
  }
}

async function getLinkLists(categories) {
  let html = '';
  for await (category of categories) {
    html += await generateLinkList(category); 
  }
  return html;
}

async function generateLinkList(category) {
  let filesMeta = category.files.map(file => {
    return getDisplayNameFromHTMLFileName(file, category.name);
  }).filter(name => !!name);
  return renderLinkList(filesMeta, category.name);  
}

function getDisplayNameFromHTMLFileName(fileName, category) {
  let splitName = fileName.split('.html');
  if (splitName.length > 1) {
    if (splitName[0].includes("/")) {
      const slashSplit = splitName[0].split("/").reverse();
      splitName = slashSplit;
    }
    return {
      displayName: capitalize(splitName[0]).replace('_', ' '),
      fileName,
      category
    }
  } else {
    return null;
  }
}

function renderLinkList(links, title) {
  let list = `
        <h2>${title}</h2>
        <ul>`;
  const linkTags = links.reduce((acc, curr) => {
    return acc + `
          <li>
            <a href="${curr.fileName}">${curr.displayName}</a>
          </li>`
  }, '');
  list += linkTags;
  list += `
        </ul>
    `;
  return list;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1); 
}
