import * as OpenCC from 'opencc-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dir = join(root, 'src', 'i18n');
const hant = JSON.parse(readFileSync(join(dir, 'zh-Hant.json'), 'utf8'));
const convert = OpenCC.Converter({ from: 'twp', to: 'cn' });

const overrides = {
  '拷贝': '复制',
  '履历': '简历',
  '国中': '初中',
  '月台门': '屏蔽门',
  '信息工程系': '资讯工程系'
};

const hans = {};
for (const [key, value] of Object.entries(hant)) {
  let out = convert(value);
  for (const [a, b] of Object.entries(overrides)) out = out.replaceAll(a, b);
  hans[key] = out;
}

writeFileSync(join(dir, 'zh-Hans.json'), JSON.stringify(hans, null, 2) + '\n');
console.log(`zh-Hans: ${Object.keys(hans).length} entries`);
