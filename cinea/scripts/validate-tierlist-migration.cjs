// Run from cinea/: node scripts/validate-tierlist-migration.cjs
// Isolated mocks only: no network or real Supabase writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const modules = new Map();
let rows = [];
let fail = '';
let sequence = 0;
const operations = [];
const supabase = {
  auth: { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) },
  from(table) {
    let operation = 'read', payload = [], filters = [], removedIds;
    const query = {
      select() { return query; },
      eq(key, value) { filters.push([key, value]); return query; },
      in(key, ids) { assert.equal(key, 'id'); removedIds = ids; return query; },
      order() { return query; },
      maybeSingle: async () => ({ data: { id: 'list' }, error: null }),
      insert(values) { operation = 'insert'; payload = values; return query; },
      upsert(values) { operation = 'upsert'; payload = values; return query; },
      delete() { operation = 'delete'; return query; },
      then(resolve, reject) { return Promise.resolve().then(() => {
        if (table === 'tier_lists') return { data: { id: 'list' }, error: null };
        assert.equal(table, 'tier_list_items');
        assert(filters.some(([key, value]) => key === 'tier_list_id' && value === 'list') || operation === 'insert' || operation === 'upsert');
        if (operation === 'read') return { data: rows.map((row) => ({ ...row })), error: null };
        operations.push(operation);
        if (fail === operation) return { data: null, error: new Error('simulated failure') };
        if (operation === 'insert') {
          const additions = payload.map((item) => ({ ...item, id: `new-${++sequence}` }));
          rows.push(...additions);
          return { data: additions, error: null };
        }
        if (operation === 'upsert') {
          for (const item of payload) {
            assert(rows.some((row) => row.id === item.id));
            rows = rows.map((row) => row.id === item.id ? { ...item } : row);
          }
          return { data: payload, error: null };
        }
        assert(removedIds && removedIds.length, 'no delete-all is permitted');
        rows = rows.filter((row) => !removedIds.includes(row.id));
        return { data: null, error: null };
      }).then(resolve, reject); },
    };
    return query;
  },
};

function load(relativeFile) {
  const filename = path.resolve(__dirname, '..', relativeFile);
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = { exports: {} }; modules.set(filename, module);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('require', 'module', 'exports', code)((name) => {
    if (name === '../lib/supabase') return { supabase };
    if (name === './tmdb') return { getMovieDetails: async () => { throw new Error('TMDB offline'); } };
    return load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), name + '.ts')));
  }, module, module.exports);
  return module.exports;
}

async function main() {
  const resolver = load('src/services/movieResolver.ts');
  const { containsTierMovie, prepareTierItems } = load('src/services/tierListItems.ts');
  const { saveTierListItems } = load('src/services/tierLists.ts');
  const originals = ['dune-2', 'oppenheimer', 'spirited-away', 'parasite'].map((movie_id, position) => ({
    id: `old-${position}`, tier_list_id: 'list', movie_id, movie_title: `Saved ${movie_id}`, tier: ['S', 'A', 'B', 'C'][position], position,
  }));
  const draft = originals.map((item) => ({ id: item.id, movieId: item.movie_id, movieTitle: item.movie_title, tier: item.tier, position: item.position }));
  assert.deepEqual(originals.map((item) => resolver.resolveTmdbId(item.movie_id)), [693134, 872585, 129, 496243]);
  assert(containsTierMovie(draft, '693134'), 'legacy/TMDB identity prevents adding duplicates');
  assert.throws(() => prepareTierItems([...draft, { movieId: '693134', movieTitle: 'Duplicate', tier: 'S', position: 4 }], originals));
  const prepared = prepareTierItems(draft, originals);
  assert.deepEqual(prepared.map((item) => item.movieId), originals.map((item) => item.movie_id));
  assert.deepEqual(prepared.map((item) => item.position), [0, 1, 2, 3]);
  assert.deepEqual(prepared.map((item) => item.tier), ['S', 'A', 'B', 'C']);
  const shuffled = prepareTierItems([{ movieId: '129', movieTitle: 'B', tier: 'B', position: 2 }, { movieId: '438631', movieTitle: 'S', tier: 'S', position: 1 }], []);
  assert.deepEqual(shuffled.map((item) => [item.tier, item.position]), [['S', 0], ['B', 1]]);
  assert.equal(await resolver.resolveMovieById('dune-2'), null);
  assert.equal(prepared[0].movieTitle, 'Saved dune-2');
  assert.equal(prepared[0].tier, 'S');
  assert.equal(prepared[0].position, 0);

  const desired = [draft[0], { movieId: '438631', movieTitle: 'Duna', tier: 'A', position: 1 }];
  rows = originals.map((row) => ({ ...row }));
  fail = 'insert';
  await assert.rejects(saveTierListItems('list', desired));
  assert.deepEqual(rows, originals);
  assert.deepEqual(operations.splice(0), ['insert']);
  fail = 'upsert';
  await assert.rejects(saveTierListItems('list', desired));
  assert(originals.every((item) => rows.some((row) => row.id === item.id)));
  assert.deepEqual(operations.splice(0), ['insert', 'upsert']);
  assert.equal(rows.length, 5);
  fail = '';
  const saved = await saveTierListItems('list', desired);
  assert.deepEqual(operations.splice(0), ['upsert', 'delete'], 'retry reuses already inserted item');
  assert.equal(rows.length, 2);
  assert.equal(saved[0].movie_id, 'dune-2');
  assert.equal(saved[1].movie_id, '438631');
  assert.deepEqual(saved.map((item) => item.position), [0, 1]);
  const beforeInvalid = JSON.stringify(rows);
  await assert.rejects(saveTierListItems('list', [{ movieId: 'invalid', movieTitle: '', tier: 'Z', position: -1 }]));
  assert.equal(JSON.stringify(rows), beforeInvalid);
  assert.deepEqual(operations, []);
  fail = 'delete';
  await assert.rejects(saveTierListItems('list', []));
  assert.equal(rows.length, 2);
  fail = '';
  await saveTierListItems('list', []);
  assert.equal(rows.length, 0, 'explicit removal of every item is supported');
  console.log('PASS: legacy IDs, canonical duplicates, positions, offline preservation, validation before writes, insert/upsert/delete ordering, partial-failure preservation and safe retry.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
