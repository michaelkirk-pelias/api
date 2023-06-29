var logger = require( 'pelias-logger' ).get( 'api' );

/**
 * @callback mgetCallback
 * @param {import('@elastic/elasticsearch').ApiError|null} err
 * @param {*} [docs]
 * @param {*} [response]
 */

/**
 * @param {import('@elastic/elasticsearch').Client} esclient 
 * @param {*} query 
 * @param {mgetCallback} cb 
 */
function service( esclient, query, cb ){

  // elasticsearch command
  var cmd = {
    body: {
      docs: query
    }
  };

  // query elasticsearch
  const startTime = new Date();
  esclient.mget( cmd, function( err, res){
    if (res && res.body) {
      res.body.response_time = new Date() - startTime;
    }

    // handle elasticsearch errors
    if( err ){
      logger.error( `elasticsearch error ${err}`);
      return cb( err );
    }

    // map returned documents
    var docs = [];
    if( res && res.body && Array.isArray(res.body.docs) ){

      docs = res.body.docs.filter( function( doc ){

        // remove docs not actually found
        return doc.found;

      }).map( function( doc ){

        // map metadata in to _source so we
        // can serve it up to the consumer
        doc._source._id = doc._id;

        return doc._source;
      });
    }

    // fire callback
    return cb( null, docs, res );
  });

}

module.exports = service;
