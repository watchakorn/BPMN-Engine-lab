const assert = require('assert');
const fs = require('fs');
const path = require('path');

const simpleBpmn = fs.readFileSync(
  path.join(__dirname, 'bpmn', 'credit-card-simple.bpmn20.xml'),
  'utf8'
);

assert.ok(
  simpleBpmn.includes('${creditScore >= 450 && creditScore < 700}'),
  'Simple BPMN manual review range should be 450-699'
);

assert.ok(
  simpleBpmn.includes('${creditScore < 450}'),
  'Simple BPMN auto reject threshold should be score < 450'
);

console.log('bpmnPolicy tests passed');
