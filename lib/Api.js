const axios = require('axios');


function interceptor(req) {
  return req.data.status === 'OK' ? req.data.result : Promise.reject(req);
}


class Api {
  constructor(baseURL = 'https://codeforces.com/api') {
    this._api = axios.create({ baseURL });
    this._api.interceptors.response.use(interceptor);
  }

  contestList(gym = false, otherParams = {}) {
    return this._api.get('/contest.list', { params: { gym, ...otherParams } });
  }

  contestStandings(contestId, showUnofficial = false, otherParams = {}) {
    const params = { contestId, showUnofficial, ...otherParams };

    return this._api.get('/contest.standings', { params });
  }

  contestStatus(contestId) {
    return this._api.get('/contest.status', { params: { contestId } });
  }

  contestRatingChanges(contestId) {
    return this._api.get('/contest.ratingChanges', { params: { contestId } });
  }
}


module.exports = Api;
