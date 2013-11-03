
function TwitterFetcherProxy(config) {
  var tweet,
      fetcher,
      processPeriod,
      processCallback;

  init(config);

  return {
    count: fetcher.length,
    setWidgetID: fetcher.setWidgetID
  };


  

  function fetch() {
    var tweet = fetcher.pop();

    if (tweet) {
        processCallback(tweet);
    }
    setTimeout(fetch, processPeriod);
  }

  function noOp(tweet) {
    
  }

  function init(config) {
    processPeriod = config.processPeriod || 5000;
    processCallback = config.processCallback || noOp;

    fetcher = new TwitterFetcher({
      id: config.widgetID,
      tweets : config.tweets,
      fetchTime: config.fetchTime
    });

    setTimeout(fetch, processPeriod);
  }

  function TwitterFetcher(config) {
    var _tweets = [],
        _tweetIDs = []
        _index = -1,
        _readyCallback = config.ready,
        _twitterID = config.id,
        _maxTweets = config.tweets || 500,
        _lastTweetTime = config.startTime,
        _fetchTimeout = undefined,
        _fetchPeriod = config.fetchTime || 30000,
        _maxIndex = 1;

    _init();

    function _init() {
      _fetch();
    }

    function _dateFormatter(date) {
      // Correct timeZone
      return new Date(date);
    }

    function _processTweets(tweets) {
      var youngestTweet,
          lastIndex = undefined;
      
      // We add tweets just if they are newer
      for (var t in tweets) {
        var tweet = _tweetFormatter(tweets[t]),
            tweetDate = new Date(tweet.time);

        if (!_lastTweetTime || tweetDate > _lastTweetTime) {
          if (!lastIndex) {
            lastIndex = tweets.length - 1;
          }
          _tweets.push(tweet);
          if (!youngestTweet) {
            youngestTweet = tweetDate;
          }
        } else {
          break;
        }
      }

      if (lastIndex) {
        if (_index < _maxIndex) {
          _index = _maxIndex;
        }
      }

      if (youngestTweet) {
        _lastTweetTime = youngestTweet;
      }

      if (_readyCallback) { 
        _readyCallback();
        _readyCallback = null;
      }

      _fetchTimeout = setTimeout(_fetch, _fetchPeriod);
    }

    function pop() {
        if (_tweets.length == 0) return null;

        var tweet = _tweets[0];
        _tweets.splice(0, 1);

        return tweet;
    }

    function length () {
        return _tweets.length;
    };

    function _fetch() {
      clearTimeout(_fetchTimeout);
      twitterFetcher.fetch(_twitterID, '', _maxTweets, true, true, true, _dateFormatter, false, _processTweets, false);
    }

    function _tweetFormatter(tweet) {
      var $tweet = $(tweet);
      var components = $tweet.select("img");
      var user = $($tweet.children()[0]).attr('aria-label');
      var screenNameBegin = user.indexOf(" (screen name: ");
      var date = new Date(components[2].innerHTML);
      var linkElements = $($tweet.select("a")[1]).children();
      var imageURL = $tweet.attr("data-pic-twitter");
      var tweetId = $tweet.attr("data-tweet-id");

      return {
        tweet_id: tweetId,
        retweet: false,
        text: components[1].innerText.substr(0, 140),
        created_at: date,
        user: {
          profile_image_url_https: $($(components[0]).children()[0]).children()[0].src,
          profile_image_url: $($(components[0]).children()[0]).children()[0].src,
          screen_name: user.substr(screenNameBegin+" (screen name: ".length).slice(0, -1),
          name: user.substr(0, screenNameBegin)
        }
      };
    }

    function  setWidgetID(id) {
      _twitterID = id;
      _tweets = [];
      _index = -1;
      _newerTweetsIndex = 0;
      _lastTweetTime = undefined;
      _maxIndex = 1;
    }

    return {
      pop: pop,
      setWidgetID: setWidgetID
    }
  }
}