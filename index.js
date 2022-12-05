(async () => {
  const fs = require('fs')
  const XmlSplit = require('xmlsplit')

  await fs.mkdir('data', { recursive: true }, (e) => { if (e) console.error(e) });
  await fs.mkdir('data-dump', { recursive: true }, (e) => { if (e) console.error(e) });

  const dirCont = fs.readdirSync('data-dump');
  const files = dirCont.filter((filename) => filename.match(/.*\.xml/ig));

  if (!files?.length) {
    console.error('No XML file found, quiting..');
    process.exit();
  }

  console.log('Splitting wiki file..');

  const isRedirectSamePage = new RegExp(`#REDIRECT \\[\\[${title}\\]\\]`, 'i')

  var xmlsplit = new XmlSplit(1, 'page')
  var inputStream = fs.createReadStream(`data-dump/${files[0]}`) // from somewhere
  const titles = new Set();
  inputStream.pipe(xmlsplit).on('data', function(data) {
    let xmlDocument = data.toString();
    const title = (xmlDocument.match(/<title>(.*)<\/title>/) || [,'undefined'])[1];

    if (title.includes('/')) return;
    if (
      titles.has(title)
      || isRedirectSamePage.test(title)
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

})()