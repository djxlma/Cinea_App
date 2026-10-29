// Run from cinea/: node scripts/validate-review-migration.cjs
// Uses isolated mocks: no network, credentials, or real Supabase writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const modules = new Map();
let tmdbCalls = 0;
let failTmdb = false;
const queriedIds = [];
const inserted = [];
let rows = [];
const supabase = {
  auth: { getUser: async () => ({ data: { user: { id: 'authenticated-user' } }, error: null }) },
  from: (table) => {
    assert.equal(table, 'reviews');
    return {
      select: () => ({ in: (column, ids) => {
        assert.equal(column, 'movie_id');
        assert(ids.length > 0);
        queriedIds.push(ids);
        return { order: async (column, options) => {
          assert.equal(column, 'created_at');
          assert.equal(options.ascending, false);
          return { data: rows.filter((row) => ids.includes(row.movie_id)), error: null };
        } };
      } }),
      insert: (values) => {
        inserted.push(...values);
        return { select: () => ({ single: async () => ({ data: values[0], error: null }) }) };
      },
    };
  },
};

function load(relativeFile) {
  const filename = path.resolve(__dirname, '..', relativeFile);
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = { exports: {} };
  modules.set(filename, module);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const requireMock = (name) => {
    if (name === '../lib/supabase') return { supabase };
    if (name === './tmdb') return { getMovieDetails: async (id) => {
      tmdbCalls++;
      await Promise.resolve();
      if (failTmdb) throw new Error('offline');
      return { id: String(id), tmdbId: id, title: 'TMDB title', posterUrl: 'https://example.test/poster.jpg' };
    } };
    return load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), name + '.ts')));
  };
  new Function('require', 'module', 'exports', code)(requireMock, module, module.exports);
  return module.exports;
}

async function main() {
  const resolver = load('src/services/movieResolver.ts');
  const mapping = load('src/data/legacyMovieTmdbMap.ts');
  const service = load('src/services/reviews.ts');
  assert.equal(resolver.resolveTmdbId('438631'), 438631);
  for (const movie of mapping.legacyMovies) {
    assert.equal(resolver.resolveTmdbId(movie.slug), movie.tmdbId);
    assert.equal(mapping.getLegacySlugForTmdbId(movie.tmdbId), movie.slug);
    assert.deepEqual(resolver.getEquivalentMovieIds(movie.slug), [String(movie.tmdbId), movie.slug]);
  }
  for (const invalid of ['', '0', '-1', '1.5', '1e3', 'unknown', '9007199254740992']) {
    assert.equal(resolver.resolveTmdbId(invalid), null);
    assert.deepEqual(resolver.getEquivalentMovieIds(invalid), []);
  }

  const [legacy, numeric] = await Promise.all([
    resolver.resolveMovieById('dune-2'), resolver.resolveMovieById('693134'),
  ]);
  assert.equal(legacy, numeric);
  assert.equal(tmdbCalls, 1, 'aliases share the in-flight request');
  await resolver.resolveMovieById('dune-2');
  assert.equal(tmdbCalls, 1, 'successful details are cached');

  failTmdb = true;
  assert.equal(await resolver.resolveMovieById('438631'), null);
  const reviews = [
    { id: 'legacy', movie_id: 'dune-2', movie_title: 'Saved legacy title', created_at: '2026-10-28T10:00:00Z' },
    { id: 'new', movie_id: '693134', movie_title: 'Saved new title', created_at: '2026-10-29T10:00:00Z' },
    { id: 'offline', movie_id: '438631', movie_title: 'Saved offline title', created_at: '2026-10-29T11:00:00Z' },
  ];
  const cards = resolver.getReviewedMovieCards(reviews, {});
  assert.equal(cards.length, 2, 'Profile deduplicates film identity, including aliases');
  assert.equal(cards[1].title, 'Saved offline title');
  assert.equal(cards[1].posterUrl, null, 'failed TMDB resolution preserves the card');
  const enriched = resolver.getReviewedMovieCards(reviews, { '693134': legacy });
  assert.equal(enriched[0].id, '693134');
  assert.equal(enriched[0].title, 'TMDB title');
  failTmdb = false;
  assert(await resolver.resolveMovieById('438631'), 'failed requests are not cached');

  rows = [...reviews, reviews[0]];
  const result = await service.getReviewsByMovie('693134');
  assert.deepEqual(queriedIds[0], ['693134', 'dune-2']);
  assert.deepEqual(result.map((review) => review.id), ['new', 'legacy']);
  assert.deepEqual(service.deduplicateReviews(rows).map((review) => review.id), ['offline', 'new', 'legacy']);
  assert.equal(service.deduplicateReviews([reviews[0], reviews[1]]).length, 2, 'distinct user reviews are retained');
  const queryCount = queriedIds.length;
  assert.deepEqual(await service.getReviewsByMovieIds(['invalid', '']), []);
  assert.equal(queriedIds.length, queryCount, 'empty/invalid IDs never reach Supabase');

  await service.createReview({ movieId: 'dune-2', movieTitle: 'Duna: Parte Dois', rating: 5, content: 'Review' });
  assert.equal(inserted[0].movie_id, '693134');
  assert.equal(inserted[0].movie_title, 'Duna: Parte Dois');
  assert.equal(inserted[0].user_id, 'authenticated-user');
  await assert.rejects(service.createReview({ movieId: 'invalid', movieTitle: 'Invalid', rating: 5, content: 'Review' }));
  assert.equal(inserted.length, 1);
  console.log('PASS: identity, inverse mapping, equivalent IDs, cache/in-flight deduplication, offline fallback/recovery, Profile deduplication, review ordering/deduplication, safe query IDs and canonical review inserts.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
