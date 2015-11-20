var TOKEN = 'MTQ0NzQzMzAwNDg3NQ.cHJvZA.Y2xhcmVuY2VucHlAZ21haWwuY29t.TbU4LHbm5VZ-9Gtdks6lcYCCWRA';

Template.wit.helpers({
    result: function () {
        return Session.get('result');
    }
});

Template.wit.events({
    'click #getIntent': function () {
        var intent = Template.instance().$('#intent').val();
        Meteor.call('getIntent', intent, function (err, res) {
            if (err) console.log(err);
            Session.set('result', res.outcomes[0].intent);
        })
    },
    'click #search': function () {
        var query = Template.instance().$('#query').val();
        //prismatic.search(query, function (err, res) {
        //    if (err) console.log(err);
        //    console.log(res);
        //})
        prismatic.news(query, function (err, res) {
            if (err) console.log(err);
            console.log(res);
        })
        prismatic.newsUrl(query, function (err, res) {
            if (err) console.log(err);
            console.log(res);
        })
    }

});

prismatic = {
    TOKEN: 'MTQ0NzQzMzAwNDg3NQ.cHJvZA.Y2xhcmVuY2VucHlAZ21haWwuY29t.TbU4LHbm5VZ-9Gtdks6lcYCCWRA',
    URL: 'http://interest-graph.getprismatic.com/',
    search: function (query, callback) {
        HTTP.get(prismatic.URL + 'topic/search', {
            params: {
                'api-token': prismatic.TOKEN,
                'search-query': query,
                limit: 1
            }
        }, function (err, res) {
            callback(err, res);
        })
    },
    news: function (query, callback) {
        prismatic.search(query, function (err, res) {
            if (err) throw new Meteor.Error(err);
            var topics = [];
            _.each(res.data.results, function (t) {
                topics.push({topic: t.id});
            })
            HTTP.post(prismatic.URL + 'doc/search', {
                data: {
                    query: {
                        and: topics
                    }
                },
                params: {
                    'api-token': prismatic.TOKEN
                }
            }, function (err, res) {
                callback(err, res);
            })
        })


    },
    newsUrl: function (query, callback) {
        prismatic.search(query, function (err, res) {
            var topics = [];
            _.each(res.data.results, function (t) {
                topics.push(t.id);
            })
            var topicString = topics.join('%2C');
            callback(err, 'http://prismatic.github.io/explorer/?topics=' + topicString);
        })
    }
}
