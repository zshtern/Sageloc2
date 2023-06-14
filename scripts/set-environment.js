const fs = require('fs');
const path = require('path');

function readWriteSync() {
  let env = (process.env.SGL_ENV || 'dev').toLowerCase();
  console.log('Environment:', env);
  let data = fs.readFileSync(path.join('.', 'src', 'environments', `environment.${env}.ts`), 'utf-8');
  fs.writeFileSync(path.join('.', 'src', 'environments', `environment.ts`), data, 'utf-8');
  console.log(`src/environments/environment.${env}.ts was moved to src/environments/environment.ts`);
}

readWriteSync();
