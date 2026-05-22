const assert = require('assert');
const { flowableVarsToObject } = require('./flowableVars');

function testRuntimeVariableShape() {
  const vars = flowableVarsToObject([
    { name: 'applicantName', value: 'Alice' },
    { name: 'approved', value: true },
  ]);

  assert.deepStrictEqual(vars, {
    applicantName: 'Alice',
    approved: true,
  });
}

function testHistoricVariableShape() {
  const vars = flowableVarsToObject([
    { variable: { name: 'creditScore', value: 693 } },
    { variable: { name: 'riskLevel', value: 'medium' } },
    { variable: { name: 'approved', value: true } },
  ]);

  assert.deepStrictEqual(vars, {
    creditScore: 693,
    riskLevel: 'medium',
    approved: true,
  });
}

testRuntimeVariableShape();
testHistoricVariableShape();

console.log('flowableVars tests passed');
