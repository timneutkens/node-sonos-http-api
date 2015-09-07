var crypto = require('crypto');
var fs = require('fs');
var http = require('http');
var path = require('path');
var async = require('async');
var ffmpeg = require('fluent-ffmpeg');
var phrase = 'hi';
var language = 'en';

var saveState = {};
var webroot = path.resolve(__dirname + '/../../static');
var port;

// for sayall
var coordinator;
var startPlayingWhenOneBigGroup;

// for say
var groupToRejoin;

// announce volume
var announceVolume = 50;
function tryDownloadTTS(phrase, language, callback) {
    var tts_request = 'http://bing-translate-tts-demo.craic.com/text_to_speech_web_audio_api?query=' + phrase + '&language=' + language;

    // Construct a filesystem neutral filename
    var filenameMp3 = crypto.createHash('sha1').update(phrase).digest('hex') + '-' + language + '.mp3';
    var filepathMp3 = path.resolve(webroot, 'tts', filenameMp3);

    // If not already downloaded request translation
    fs.stat(filepathMp3, function (err) {
        if (err) {
            console.log('Downloading new tts message file: ' + filepathMp3);
            var file = fs.createWriteStream(filepathMp3);
            http.get(tts_request, function (response) {
                ffmpeg(response).audioBitrate('128k')
                    .audioCodec('libmp3lame')
                    // set number of audio channels
                    .audioChannels(2)
                    // set custom option
                    .addOption('-vtag', 'DIVX')
                    // set output format to force
                    .format('mp2')
                    .on('end', function() {
                        console.log('file has been converted succesfully');
                    })
                    .on('error', function(err) {
                        console.error('an error happened: ' + err.message);
                    }).pipe(file);
                //response.pipe(file);
                file.on('finish', function () {
                    file.end();
                    callback(true, filenameMp3);
                });
            }).on('error', function (err) {
                console.error('could not download file', filename, err);
                fs.unlink(dest);
                callback(false);
            });
        } else {
            console.log('Using cached tts message file: ' + filename);
            callback(true, filename);
        }
    });
}

tryDownloadTTS('The cake is a lie', 'en', function(error, filename) {
    console.log(filename);
});


//module.exports = function (api) {
//    webroot = path.resolve(__dirname + '/../../static');
//    port = '5005';
//    //api.registerAction('say', say);
//    //api.registerAction('sayall', sayAll);
//
//    // register permanent eventlistener
//    //api.discovery.on('topology-change', topologyChanged);
//};