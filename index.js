const express = require('express')
const app = express()
const port = 3001
const path = require('path');

const ytdl = require('ytdl-core');
const yt = require('youtube-search-without-api-key');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

app.use(express.urlencoded());

app.get('/', (req, res) => { res.render(path.join(__dirname, 'src/index.ejs'))})

app.get('/des', (req, res) => {
  BuscarMusica(req.query.URL,res); 
})

app.listen(port, () => {
  console.log(`Puerto ${port}`)
})

async function  BuscarVideo(Busqueda,res){
    const videos = await yt.search(Busqueda);
    if(!ytdl.validateURL(videos[0].url)) {
      return res.sendStatus(400);
    }
    res.header("Content-Disposition", `attachment; filename= ${videos[0].title}.mp4`);
    await ytdl(videos[0].url,{
       quality: 'highestvideo' ,
       filter: 'audioandvideo',
       format:'mp4'
      }).pipe(res);
    console.log(videos[0].title);
};

async function  BuscarMusica(Busqueda,res){
  const videos = await yt.search(Busqueda);
  if(!ytdl.validateURL(videos[0].url)) {
    return res.sendStatus(400);
  }
  var info = await ytdl.getBasicInfo(videos[0].url);
  res.header("Content-Disposition", `attachment; filename= ${videos[0].title}.mp3`);
  res.setHeader('Content-type', 'audio/mpeg');
  var video =  await ytdl(videos[0].url,{
    quality: 'highestvideo' ,
    filter: 'audioandvideo',
    format:'mp4'
   });
        var proc = new ffmpeg({source: video});
        proc.setFfmpegPath(ffmpegInstaller.path);
        proc.withAudioCodec('libmp3lame')
            .toFormat('mp3')          
            .outputOptions('-id3v2_version', '4')      
            .outputOptions('-metadata', 'title=' + info.videoDetails.title)
            .outputOptions('-metadata', 'artist=' + info.videoDetails.author.name)
            .output(res)
            .run();
        proc.on('end', function() {
            console.log('finished');
        });
  
};

app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
