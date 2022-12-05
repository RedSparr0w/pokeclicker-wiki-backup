const fs = require('fs')
const XmlSplit = require('xmlsplit')

const dirCont = fs.readdirSync('data-dump');
const files = dirCont.filter((filename) => filename.match(/.*\.xml/ig));

if (!files?.length) {
  return console.error('No XML file found, quiting..');
}

var xmlsplit = new XmlSplit(1, 'page')
var inputStream = fs.createReadStream(`data-dump/${files[0]}`) // from somewhere
fs.mkdir('data', { recursive: true }, (err) => {});
fs.mkdir('data-dump', { recursive: true }, (err) => {});
const titles = new Set();
inputStream.pipe(xmlsplit).on('data', function(data) {
  let xmlDocument = data.toString();
  const title = (xmlDocument.match(/<title>(.*)<\/title>/) || [,'undefined'])[1];

  if (title.includes('/')) return;
  if (
    titles.has(title)
    || title.includes('File:')
    || title.includes('Talk:')
    || title.includes('Forum:')
    || title.includes('User:')
    || title.includes('Message Wall:')
    || title.includes('talk:')
  ) return;

  titles.add(title);
  xmlDocument = `${xmlDocument.substring(0, xmlDocument.indexOf('<siteinfo>') - 3)}${xmlDocument.substring(xmlDocument.indexOf('</siteinfo>') + 12)}`

  if (title.includes(':')) {
    fs.promises.mkdir(`data/${title.replace(/:/g, '/').replace(/\/[^\/]+$/, '')}`, { recursive: true }).catch(console.error).then(() => {
      fs.writeFileSync(`data/${title.replace(/:/g, '/')}.xml`, xmlDocument);
    })
  } else {
    fs.writeFileSync(`data/${title.replace(/:/g, '/')}.xml`, xmlDocument);
  }
})
