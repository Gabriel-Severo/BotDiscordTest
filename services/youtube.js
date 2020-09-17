const simpleYT = require('simpleyt');
const playlists = require('yt-playlist-scraper');
const url = require('url');
const { formatDuration } = require('./util');

function constructDurationObj(seconds) {
  return {
    hours: ~~(seconds / 3600),
    minutes: ~~((seconds % 3600) / 60),
    seconds: seconds % 60,
    ms: seconds * 1000
  };
}
function constructVideoObj(video) {
  const duration = constructDurationObj(video.length.sec);
  return {
    title: video.title,
    author: video.author.name,
    thumbnail: video.thumbnails.slice(-1)[0].url,
    url: video.uri,
    duration,
    length: formatDuration(duration)
  };
}
function constructPlaylistVideoObj(video) {
  const duration = constructDurationObj(video.duration);
  return {
    title: video.title,
    author: video.channel.title,
    thumbnail: video.thumbnails.best.url,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    duration,
    length: formatDuration(duration)
  };
}
module.exports = async function search(link) {
  const parsed = url.parse(link, true);
  if (link.match('^https://www.youtube.com/.*?list=.*$')) {
    const id = parsed.query.list;
    let playlist;
    try {
      playlist = await playlists(id);
    } catch (e) {
      return false;
    }
    return {
      url: 'https://www.youtube.com/playlist?list=' + playlist.id,
      thumbnail: playlist.thumbnails.best.url,
      title: playlist.title,
      videos: playlist.videos.map((video) => {
        return constructPlaylistVideoObj(video);
      })
    };
  } else if (link.match('^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+')) {
    const id = parsed.query.v;
    const videos = await simpleYT(id);
    for (let video of videos) {
      if (video.identifier == id) {
        return constructVideoObj(video);
      }
    }
    return false;
  } else {
    const videos = await simpleYT(link);
    if (videos == false) {
      return false;
    }
    return constructVideoObj(videos[0]);
  }
};
