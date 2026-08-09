import basics from './basics';
import control from './control';
import collections from './collections';
import functions from './functions';
import algorithms from './algorithms';
import codeReading from './codeReading';
import extra from './extra';

export const CATEGORY_META = {
  basics: { label: '基础语法', color: '#0f766e' },
  control: { label: '分支循环', color: '#1d4ed8' },
  collections: { label: '组合类型', color: '#b45309' },
  functions: { label: '函数文件', color: '#0369a1' },
  algorithms: { label: '算法基础', color: '#be123c' },
  code_reading: { label: '读程填空', color: '#0e7490' },
  teaching: { label: '教学情境', color: '#047857' },
};

export const DIFFICULTY_META = {
  1: { label: '入门', color: '#15803d' },
  2: { label: '巩固', color: '#c2410c' },
  3: { label: '拔高', color: '#b91c1c' },
};

/** 每日练习题量 */
export const DAILY_QUESTION_COUNT = 8;

const questionBank = [
  ...basics,
  ...control,
  ...collections,
  ...functions,
  ...algorithms,
  ...codeReading,
  ...extra,
];

export default questionBank;
