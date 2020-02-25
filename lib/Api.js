const axios = require('axios');


function interceptor(req) {
  return req.data.status === 'OK' ? req.data.result : Promise.reject(req);
}

function retryAfter(delay) {
  return (reason) => {
    if ((reason.data || reason.response.data).comment === 'Call limit exceeded')
      return new Promise((resolve, reject) => {
        setTimeout(reject.bind(null, reason), delay);
      });
    else return Promise.reject(reason);
  };
}


class Api {
  constructor(baseURL = 'https://codeforces.com/api') {
    this._api = axios.create({ baseURL });
    this._api.interceptors.response.use(interceptor);
  }

  requestPool(data, generator, size = 5, timeout = 250, retries = 5) {
    const queue = [...data];
    const wait = retryAfter(timeout);

    const result = {
      ok: [],
      err: [],
    };


    const consumeData = async () => {
      while (queue.length) {
        const args = queue.pop();
        const request = () => generator(args);

        let p = request();
        for (let i = 0; i < retries; i++) {
          // se a promise falhou ele cairá nos catch(), caso contrário não fará nada
          p = p.catch(wait).catch(request);
        }

        await p.then(
          res => result.ok.push(res),
          err => result.err.push(err),
        );
      }
    };

    return Promise.all(Array(size).fill(1).map(consumeData)).then(() => result);
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
