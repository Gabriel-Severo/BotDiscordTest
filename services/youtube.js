const simpleYT = require("simpleyt");
const playlists = require("yt-playlist-scraper");
const url = require("url");

function constructDurationObj(seconds) {
  return {
    hours: ~~(seconds / 3600),
    minutes: ~~((seconds % 3600) / 60),
    seconds: seconds % 60,
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
    length: formatDuration(duration),
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
    length: formatDuration(duration),
  };
}
function formatDuration(durationObj) {
  const { hours, minutes, seconds } = durationObj;
  let length = "";
  length += `${
    hours < 1
      ? minutes
      : minutes
      ? minutes < 10
        ? hours + ":0" + minutes
        : hours + ":0" + minutes
      : "00"
  }:${seconds ? (seconds < 10 ? "0" + seconds : seconds) : "00"}`;
  return length;
}
module.exports = async function search(link) {
  const parsed = url.parse(link, true);
  if (link.match("^https://www.youtube.com/.*?list=.*$")) {
    const id = parsed.query.list;
    const playlist = await playlists(id);
    return {
      url: "https://www.youtube.com/playlist?list=" + playlist.id,
      thumbnail: playlist.thumbnails.best.url,
      title: playlist.title,
      videos: playlist.videos.map((video) => {
        return constructPlaylistVideoObj(video);
      }),
    };
  } else if (link.match("^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+")) {
    const id = parsed.query.v;
    const videos = await simpleYT(id);
    for (video of videos) {
      if (video.identifier == id) {
        return constructVideoObj(video);
      }
    }
  } else {
    const videos = await simpleYT(link);
    return constructVideoObj(videos[0]);
  }
};
