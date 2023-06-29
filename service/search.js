/**

  cmd can be any valid ES query command

**/

const _ = require('lodash');
const es = require('@elastic/elasticsearch');
const logger = require( 'pelias-logger' ).get( 'api' );

function service( esclient, cmd, cb ){

  // query elasticsearch
  const startTime = new Date();
  esclient.search( cmd, function( err, res){
    if (res.body) {
      // REVIEW: test this
      res.body.response_time = new Date() - startTime;
    }

    // handle elasticsearch errors
    if( err ){
      logger.error( `elasticsearch error ${err}` );
      return cb( err );
    }

    // in the case of query timeout the response body contains the
    // property 'timed_out=true'.
    // these responses contain partially processed results and so should
    // be discarded.
    // https://github.com/pelias/api/issues/1384
    if( _.get(res.body, 'timed_out', false) === true ){
      const err = new es.errors.TimeoutError('request timed_out=true', res);
      logger.error( `elasticsearch error ${err}` );
      return cb( err );
    }

    // map returned documents
    var docs = [];
    var meta = {
      scores: []
    };

    const hits = _.get(res.body, 'hits.hits');
    if( _.isArray( hits ) && hits.length > 0 ){
      docs = hits.map(hit => {

        meta.scores.push(hit._score);

        // map metadata in to _source so we
        // can serve it up to the consumer
        hit._source._id = hit._id;
        hit._source._score = hit._score;
        hit._source._matched_queries = hit.matched_queries;

        return hit._source;
      });
    }

    // fire callback
    return cb( null, docs, meta, res);
  });

}

module.exports = service;
