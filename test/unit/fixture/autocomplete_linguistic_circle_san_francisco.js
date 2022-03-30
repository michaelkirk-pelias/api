module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'constant_score': {
            'filter': {
              'multi_match': {
                'fields': ['name.default', 'name.en'],
                'analyzer': 'peliasQuery',
                'query': 'test',
                'boost': 100,
                'type': 'phrase',
                'slop': 3
              }
            }
          }
        }
      ],
      'should': [
        {
          'function_score': {
            'query': {
              'match_all': {

              }
            },
            'max_boost': 20,
            'functions': [
              {
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'popularity',
                  'missing': 1
                },
                'weight': 7
              }
            ],
            'score_mode': 'first',
            'boost_mode': 'replace'
          }
        },
        {
          'function_score': {
            'query': {
              'match_all': {

              }
            },
            'max_boost': 20,
            'functions': [
              {
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'population',
                  'missing': 1
                },
                'weight': 3
              }
            ],
            'score_mode': 'first',
            'boost_mode': 'replace'
          }
        }
      ],
      'filter': [
        {
          'geo_distance': {
            'distance': '20km',
            'distance_type': 'plane',
            'center_point': {
              'lat': 37.83239,
              'lon': -122.35698
            }
          }
        }
      ]
    }
  },
  'size': 20,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
