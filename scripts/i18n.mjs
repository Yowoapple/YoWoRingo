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
  '信息工程系': '资讯工程系',
  '豪雨': '暴雨',
  '震度': '烈度',
  '规模': '震级',
  '录像': '视频'
};

const byKey = {
  'First warning estimate: M{mag}, {depth} km deep': '第一报估计：震级 {mag} 级，深度 {depth} 公里',
  'Retrospective, {n} key cities. Strong-shaking misses {a} to {b}. Mean error {c} to {d} intensity levels.': '回溯模拟，{n} 个关键城市。高烈度漏报从 {a} 变成 {b}；平均误差从 {c} 变成 {d} 度。'
};

const hans = {};
for (const [key, value] of Object.entries(hant)) {
  let out = convert(value);
  for (const [a, b] of Object.entries(overrides)) out = out.replaceAll(a, b);
  hans[key] = byKey[key] ?? out;
}

writeFileSync(join(dir, 'zh-Hans.json'), JSON.stringify(hans, null, 2) + '\n');
console.log(`zh-Hans: ${Object.keys(hans).length} entries`);
