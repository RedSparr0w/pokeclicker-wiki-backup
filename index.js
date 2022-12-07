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


  var xmlsplit = new XmlSplit(1, 'page')
  var inputStream = fs.createReadStream(`data-dump/${files[0]}`) // from somewhere
  const titles = {};
  inputStream.pipe(xmlsplit).on('data', function(data) {
    let xmlDocument = data.toString();
    let title = (xmlDocument.match(/<title>(.*)<\/title>/) || [,'undefined'])[1];
    const date = new Date((xmlDocument.match(/<timestamp>(.*)<\/timestamp>/) || [,'0'])[1]);

    // Move language to the start
    if (title.startsWith('Translations:')) title = title.replace(/:(.*)\/(.*)\/(.*)/, ':$3/$1/$2');
    if (/\/[a-z]{2}$/.test(title)) {
      if (title.includes(':'))
        title = title.replace(/:(.*)\/([a-z]{2})$/, ':$2/$1');
      else
        title = title.replace(/(.*)\/([a-z]{2})$/, 'Main:$2/$1');
    }

    if (
      titles[title] > date
      || title.includes('File:')
      || title.includes('Talk:')
      || title.includes('Forum:')
      || title.includes('User:')
      || title.includes('Message Wall:')
      || title.includes('talk:')
    ) return;

    if (!title.includes(':')) {
      title = `Main:${title}`;
    }

    const isRedirectSamePage = new RegExp(`#REDIRECT \\[\\[${title}\\]\\]`, 'i')
    if (isRedirectSamePage.test(xmlDocument)) return;

    titles[title] = date.getTime(); 
    // Remove our site info
    if (xmlDocument.includes('<siteinfo>')) xmlDocument = `${xmlDocument.substring(0, xmlDocument.indexOf('<siteinfo>') - 3)}${xmlDocument.substring(xmlDocument.indexOf('</siteinfo>') + 12)}`;
    // Replace any extra revisions
    xmlDocument = xmlDocument.replace('<revision>', '<revision-main>').replace('</revision>', '</revision-main>');
    while (xmlDocument.includes('<revision>') && xmlDocument.includes('</revision>')) xmlDocument = `${xmlDocument.substring(0, xmlDocument.indexOf('<revision>') - 3)}${xmlDocument.substring(xmlDocument.indexOf('</revision>') + 11)}`;
    xmlDocument = xmlDocument.replace('<revision-main>', '<revision>').replace('</revision-main>', '</revision>');

    // Update our titles
    title = title.replace(/:/g, '/');

    if (title.includes('/')) {
      fs.promises.mkdir(`data/${title.replace(/\/[^\/]+$/, '')}`, { recursive: true }).catch(console.error).then(() => {
        fs.writeFileSync(`data/${title}.xml`, xmlDocument);
      })
    } else {
      fs.writeFileSync(`data/${title}.xml`, xmlDocument);
    }
  })

})()