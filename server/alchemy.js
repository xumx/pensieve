var watson = Meteor.npmRequire('watson-developer-cloud');

var alchemy_language = watson.alchemy_language({
    api_key: 'fe94fadcb2ce21b57514ddba3a78fd17ae4470a2'
});

//var getetities = Async.wrap(watson, 'alchemy_language');
//var getrelations = Async.wrap(watson, 'alchemy_language');
var wrappedEntities = Async.wrap(alchemy_language,'entities');
var wrappedRelations = Async.wrap(alchemy_language,'relations');
//Session.set('ent' , entities);

Meteor.methods({  
    getEntities : function(){
        var params = {
            url: 'http://www.businessinsider.com/heres-how-to-get-a-job-at-facebook-2014-12'
            //url: link
        };
        var entities = [];
     wrappedEntities(params,function (err, response) {
         
        if (err)
            console.log('error:', err);
        else{
         console.log('hi -- entities');   
            for (var i = 0 ; i < response.entities.length ; i++) {
                if(response.entities[i].relevance>=0.5)
                    entities.push(response.entities[i].text);
            };
        }
        console.log(JSON.stringify(entities,null,2));
       return entities;
    });
    },

    /*getRelations : function(entityArray){
        var params = {
            url: 'http://www.businessinsider.com/heres-how-to-get-a-job-at-facebook-2014-12'
            //url: link
        };
        var entities;
        wrappedRelations(params,function (err, response){
          //  console.log('hi');
         if (err)
            console.log('error:', err);
        else{

            for (var i = 0; i < entityArray.length; i++) {
                entities
            };
            
            for(var i=0;i<response.relations.length;i++){
                for(var j=0;j<entities.length;j++){
                    var punctuationless = response.relations[i].subject.text.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                    var finalStringA = punctuationless.replace(/\s{2,}/g," ");
                    var punctuationless2 = entities[j].replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                    var finalStringB = punctuationless2.replace(/\s{2,}/g," ");                
                    if(finalStringB===finalStringA)
                        var entity = entityArray[j];
                        entityArray[j] = {
                            relations: [
                            {

                            }]
                        }
                        relations.push(response.relations[i].object.text);
                    }
                }
            }
        });
    console.log(JSON.stringify(entities));
    return entities;
    }*/
});