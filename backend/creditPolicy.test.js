const assert = require('assert');
const {
  getCreditData,
  getCreditDecision,
  flattenCreditVars,
} = require('./creditPolicy');

function testDeterministicCreditData() {
  const first = getCreditData('1234567890123');
  const second = getCreditData('1234567890123');

  assert.deepStrictEqual(first, second);
  assert.strictEqual(first.nationalId, '1234567890123');
  assert.ok(first.creditScore >= 300 && first.creditScore <= 850);
  assert.ok(['low', 'medium', 'high'].includes(first.riskLevel));
  assert.ok(['auto_approve', 'manual_review', 'auto_reject'].includes(first.recommendation));
}

function testDecisionThresholds() {
  assert.deepStrictEqual(getCreditDecision(700, 700), {
    status: 'approved',
    approved: true,
    recommendation: 'auto_approve',
    autoDecision: true,
  });
  assert.deepStrictEqual(getCreditDecision(699, 700), {
    status: 'pending',
    approved: null,
    recommendation: 'manual_review',
    autoDecision: false,
  });
  assert.deepStrictEqual(getCreditDecision(399, 700), {
    status: 'rejected',
    approved: false,
    recommendation: 'auto_reject',
    autoDecision: true,
  });
}

function testFlattenCreditVars() {
  const vars = flattenCreditVars({
    applicantName: 'Alice',
    creditCheck: {
      creditScore: 685,
      riskLevel: 'medium',
      existingCards: 2,
      monthlyDebt: 15000,
      recommendation: 'manual_review',
    },
  });

  assert.strictEqual(vars.applicantName, 'Alice');
  assert.strictEqual(vars.creditScore, 685);
  assert.strictEqual(vars.riskLevel, 'medium');
  assert.strictEqual(vars.existingCards, 2);
  assert.strictEqual(vars.monthlyDebt, 15000);
  assert.strictEqual(vars.recommendation, 'manual_review');
}

testDeterministicCreditData();
testDecisionThresholds();
testFlattenCreditVars();

console.log('creditPolicy tests passed');
