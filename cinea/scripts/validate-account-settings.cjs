// Run from cinea/: node scripts/validate-account-settings.cjs
// No network, credentials, or writes to Supabase: uses isolated mocks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
let logoutCalls = 0;
let finishLogout;
let passwordError = null;
const updatedPasswords = [];
const supabase = { auth: {
  signOut: (options) => {
    assert.deepEqual(options, { scope: 'local' });
    logoutCalls++;
    return new Promise((resolve) => { finishLogout = resolve; });
  },
  updateUser: async (input) => {
    updatedPasswords.push(input);
    return { error: passwordError };
  },
} };
function load(filename) {
  const file = path.resolve(__dirname, '..', filename);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('require', 'module', 'exports', code)(() => ({ supabase }), module, module.exports);
  return module.exports;
}
async function main() {
  const { validateProfileForm, profileSaveError, validatePassword } = load('src/services/accountValidation.ts');
  const form = { name: '  Maria Silva  ', username: '  Maria.Silva  ', bio: '  Cinema  ' };
  assert.deepEqual(validateProfileForm(form, 'old').value, { display_name: 'Maria Silva', username: 'maria.silva', bio: 'Cinema' });
  assert(validateProfileForm({ ...form, name: '   ' }, 'old').error);
  assert(validateProfileForm({ ...form, name: 'a'.repeat(61) }, 'old').error);
  for (const username of ['', 'ab', 'a'.repeat(31), 'nome com espaço', 'nome!', '@nome', 'a-b']) {
    assert(validateProfileForm({ ...form, username }, 'old').error, `must reject ${username}`);
  }
  assert.equal(validateProfileForm({ ...form, username: 'Nome Legado' }, 'Nome Legado').value.username, 'Nome Legado');
  assert(validateProfileForm({ ...form, bio: 'a'.repeat(161) }, 'old').error);
  assert.equal(validateProfileForm({ ...form, bio: '   ' }, 'old').value.bio, null);
  assert.equal(profileSaveError({ code: '23505', message: 'technical database detail' }), 'Este nome de usuário já está em uso.');
  assert(!profileSaveError(new Error('technical secret detail')).includes('technical'));
  assert(validatePassword('1234567', '1234567'));
  assert(validatePassword('12345678', 'different'));
  assert(validatePassword('        ', '        '));
  assert.equal(validatePassword('safe password', 'safe password'), null);

  const account = load('src/services/account.ts');
  const first = account.signOutCurrentUser();
  const second = account.signOutCurrentUser();
  assert.equal(first, second);
  assert.equal(logoutCalls, 1);
  finishLogout({ error: new Error('technical network detail') });
  await assert.rejects(first, /Não foi possível sair/);
  const retry = account.signOutCurrentUser();
  assert.equal(logoutCalls, 2, 'failure releases the in-flight lock');
  finishLogout({ error: null });
  await retry;
  await account.changeCurrentPassword('new password');
  assert.deepEqual(updatedPasswords[0], { password: 'new password' });
  for (const [code, expected] of [
    ['same_password', /diferente da atual/],
    ['weak_password', /mais forte/],
    ['reauthentication_needed', /autenticar novamente/],
    ['unknown', /Não foi possível alterar/],
  ]) {
    passwordError = { code, message: 'technical internal message' };
    await assert.rejects(account.changeCurrentPassword('new password'), expected);
  }
  console.log('PASS: trim, required/length/username validation, unchanged legacy username, bio limit, conflict mapping, password confirmation, logout double-submit/retry and friendly Auth errors.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
