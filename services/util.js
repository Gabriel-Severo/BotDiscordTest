function formatDuration(durationObj) {
  const { hours, minutes, seconds } = durationObj;
  let length = '';
  length += `${
    hours < 1
      ? minutes
      : minutes
      ? minutes < 10
        ? hours + ':0' + minutes
        : hours + ':' + minutes
      : '00'
  }:${seconds ? (seconds < 10 ? '0' + seconds : seconds) : '00'}`;
  return length;
}
function estimatedToPlay(message) {
  let totalMS = 0;
  message.guild.musicData.queue.forEach((video) => {
    totalMS += video.duration.ms;
  });

  if (message.guild.musicData.songDispatcher) {
    const streamTime = message.guild.musicData.songDispatcher.streamTime;
    const nowPlaying = message.guild.musicData.nowPlaying.duration.ms;

    totalMS += nowPlaying - streamTime;
  }
  const time = {
    seconds: ~~((totalMS / 1000) % 60),
    minutes: ~~((totalMS / (1000 * 60)) % 60),
    hours: ~~((totalMS / (1000 * 3600)) % 24)
  };
  return formatDuration(time);
}
module.exports = {
  estimatedToPlay,
  formatDuration
};
