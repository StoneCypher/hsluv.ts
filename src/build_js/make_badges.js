
const fs        = require('fs'),
      coverData = `${fs.readFileSync('./coverage/clover.xml')}`,
      jestData  = JSON.parse(`${fs.readFileSync('./coverage/jest.json')}`),
      package   = JSON.parse(`${fs.readFileSync('./package.json')}`);

const xml2js = require('xml2js'),
      parser = new xml2js.Parser({ attrkey: "ATTR" });

const { BadgeFactory } = require('gh-badges'),
      bf               = new BadgeFactory();

const fmt = ({ text, color, template }) =>
  ({ text, color, template });

const badge = (name, cfg) => {

  const baseText = cfg? ((typeof cfg.text === 'string')? [name, cfg.text] : cfg.text) : 'missing';
  const uCfg = Object.assign({ color: 'red', template: 'flat' }, cfg);
        uCfg.text = baseText;
  fs.writeFileSync(`badges/${name}.svg`, bf.create(fmt(uCfg)) , 'utf-8');
}





/*
  {
    statements: '221',
    coveredstatements: '161',
    conditionals: '40',
    coveredconditionals: '26',
    methods: '44',
    coveredmethods: '25',
    elements: '305',
    coveredelements: '212',
    complexity: '0',
    loc: '221',
    ncloc: '221',
    packages: '1',
    files: '3',
    classes: '3'
  }
*/

const colorFor = n => {

  if (n === 1) { return 'blue'; }
  if (n === 0) { return 'black'; }

  if (n > 0.9) { return 'green'; }
  if (n > 0.5) { return 'goldenrod'; }

  return 'red';

};



const makeCoverageBadges = () => {

  parser.parseString(coverData, (_, r) => {

    const metrics = r.coverage.project[0].metrics[0].ATTR;

    const coverage      = metrics.coveredstatements / metrics.statements,
          coverageText  = ['Coverage', `${(coverage * 100).toFixed(2)}% (${metrics.coveredstatements.toLocaleString()} of ${metrics.statements.toLocaleString()} statements)`];

    badge('jest-coverage', { text: coverageText, color: colorFor(coverage) });

  });

};



const makeTestBadges = () => {

  const passed      = jestData.numPassedTests / jestData.numTotalTests,
        passedText  = ['Tests passed', `${(passed * 100).toFixed(2)}% (${jestData.numPassedTests.toLocaleString()}${passed < 1? ` of ${jestData.numTotalTests.toLocaleString()}` : ''} tests)`];

  const spassed     = jestData.numPassedTestSuites / jestData.numTotalTestSuites,
        spassedText = ['Suites passed', `${(spassed * 100).toFixed(2)}% (${jestData.numPassedTestSuites.toLocaleString()}${spassed < 1? ` of ${jestData.numTotalTestSuites.toLocaleString()}` : ''} suites)`];

  badge('jest-tests',  { text: passedText,  color: colorFor(passed)  });
  badge('jest-suites', { text: spassedText, color: colorFor(spassed) });

};



const makeVersionBadges = () => {

  badge('version', { text: ['Version', package.version], color: 'black' });

};



makeCoverageBadges();
makeTestBadges();
makeVersionBadges();
