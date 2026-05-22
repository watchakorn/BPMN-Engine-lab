function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getRiskLevel(creditScore) {
  if (creditScore >= 700) return 'low';
  if (creditScore >= 400) return 'medium';
  return 'high';
}

function getCreditDecision(creditScore, autoApproveThreshold = 700) {
  if (creditScore >= autoApproveThreshold) {
    return {
      status: 'approved',
      approved: true,
      recommendation: 'auto_approve',
      autoDecision: true,
    };
  }

  if (creditScore < 400) {
    return {
      status: 'rejected',
      approved: false,
      recommendation: 'auto_reject',
      autoDecision: true,
    };
  }

  return {
    status: 'pending',
    approved: null,
    recommendation: 'manual_review',
    autoDecision: false,
  };
}

function getCreditData(nationalId) {
  const h = hashCode(String(nationalId || ''));
  const creditScore = 300 + (h % 551);
  const existingCards = h % 5;
  const monthlyDebt = (h % 80) * 1000;
  const decision = getCreditDecision(creditScore);

  return {
    nationalId,
    creditScore,
    riskLevel: getRiskLevel(creditScore),
    existingCards,
    monthlyDebt,
    recommendation: decision.recommendation,
  };
}

function parseCreditCheck(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

function flattenCreditVars(vars) {
  const credit = parseCreditCheck(vars.creditCheck);
  if (!credit || typeof credit !== 'object') return vars;

  return {
    ...vars,
    creditScore: vars.creditScore ?? credit.creditScore,
    riskLevel: vars.riskLevel ?? credit.riskLevel,
    existingCards: vars.existingCards ?? credit.existingCards,
    monthlyDebt: vars.monthlyDebt ?? credit.monthlyDebt,
    recommendation: vars.recommendation ?? credit.recommendation,
  };
}

module.exports = {
  getCreditData,
  getCreditDecision,
  flattenCreditVars,
};
