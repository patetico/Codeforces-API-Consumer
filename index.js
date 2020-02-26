const Api = require('./lib/Api');

async function main() {
  const api = new Api();
  const contests = await api.contestList();

  const resultStandings = await api.requestPool(
    contests.filter(c => c.phase !== 'BEFORE').map(c => c.id),
    (id) => api.contestStandings(id),
  );

  const resultStatuses = await api.requestPool(
    contests.filter(c => c.phase !== 'BEFORE').map(c => c.id),
    (id) => api.contestStatus(id),
  );

  const resultRatingChanges = await api.requestPool(
    contests.filter(c => c.phase === 'FINISHED').map(c => c.id),
    (id) => api.contestRatingChanges(id),
  );
}

main();
