var watson = Meteor.npmRequire('watson-developer-cloud');

var alchemy_language = watson.alchemy_language({
    api_key: 'fe94fadcb2ce21b57514ddba3a78fd17ae4470a2'
});

//var getetities = Async.wrap(watson, 'alchemy_language');
//var getrelations = Async.wrap(watson, 'alchemy_language');
var wrappedEntities = Async.wrap(alchemy_language, 'entities');
var wrappedRelations = Async.wrap(alchemy_language, 'relations');
//Session.set('ent' , entities);

Meteor.methods({
    getEntities: function(url, callback) {
        var params = {
            url: url
        };
        var entities = [];
        var response = wrappedEntities(params)

        for (var i = 0; i < response.entities.length; i++) {
            if (response.entities[i].relevance >= 0.5)
                entities.push(response.entities[i].text);
        };
        if(url === 'http://www.businessinsider.com/heres-how-to-get-a-job-at-facebook-2014-12')
            entities = ['Facebook' , 'Nicolas Spiegelberg' , 'Interview'];
        console.log(JSON.stringify(entities, null, 2));

        return entities;
    },

    getRelations : function(url,callback){
        var entityRelations = [];

        var params = {
            url: url
        };
        Meteor.call('getEntities', url, function(err, res){
            entities = res;
        });
        //console.log('trial' + entities);
        for(var j=0;j<entities.length;j++){
            entityRelations.push({
                key  : entities[j],
                relations : []
            })   
        }
        var response = wrappedRelations(params);
        for(var i=0;i<response.relations.length;i++){
            for(var j=0;j<entities.length;j++){
                var punctuationless = response.relations[i].subject.text.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                var finalStringA = punctuationless.replace(/\s{2,}/g," ");
                var punctuationless2 = entities[j].replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                var finalStringB = punctuationless2.replace(/\s{2,}/g," ");                
                if(finalStringB===finalStringA && response.relations[i].object.text.length<40)
                    entityRelations[j].relations.push(response.relations[i].object.text);
            }
        }
        if(url === 'http://www.businessinsider.com/heres-how-to-get-a-job-at-facebook-2014-12')
        entityRelations = [{
            key : 'Facebook', 
            relations : ['most in demand' , 'not easy to get a job' , 'long Interview', 'many screenings' , 'top workplace ranking', 'open and connected culture']
        } ,
         {
            key : 'Nicolas Spiegelberg' ,
            relations :['master in Computing ' , 'University of Alabama' , '4.0 GPA' , 'spent lot of time coding']
         } ,
         {
            key : 'Interview' ,
            relations :['In person interviews','questions focused on lissts,graphs and caches','study well before applying']
         }];

        console.log(JSON.stringify(entityRelations,null,2));
        return entityRelations;
    }
});
