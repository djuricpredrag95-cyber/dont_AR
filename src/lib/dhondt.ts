export interface Party {
  name: string;
  votes: number;
  isMinority: boolean;
  minorityCoefficient: number; // 1 for regular, 1.35 for minority
}

export interface ElectionData {
  municipality: string;
  totalVoters: number;
  totalMandates: number;
  totalVoted: number;
  totalInBox: number;
  totalInvalid: number;
  parties: Party[];
}

export interface DhondtResult {
  quotients: number[][]; // [partyIndex][divisor] 
  mandates: number[];
  mandateMatrix: boolean[][]; // which quotients won mandates
  thresholdQuotient: number;
  totalVoted: number;
  totalInBox: number;
  totalInvalid: number;
  totalValid: number;
  percentVoted: number;
  partyPercentages: number[];
}

export function calculateDhondt(data: ElectionData): DhondtResult {
  const { parties, totalMandates, totalVoters, totalVoted, totalInBox, totalInvalid } = data;
  
  const totalValid = totalInBox - totalInvalid;
  const percentVoted = totalVoters > 0 ? (totalVoted / totalVoters) * 100 : 0;

  const partyPercentages = parties.map(p => totalValid > 0 ? (p.votes / totalValid) * 100 : 0);

  // Calculate quotients
  const quotients: number[][] = parties.map((party) => {
    const result: number[] = [];
    for (let d = 1; d <= totalMandates; d++) {
      const adjustedVotes = party.votes * party.minorityCoefficient;
      result.push(adjustedVotes / d);
    }
    return result;
  });

  // Find all quotients with their party index and divisor
  const allQuotients: { value: number; partyIdx: number; divisor: number }[] = [];
  quotients.forEach((partyQ, pIdx) => {
    partyQ.forEach((q, dIdx) => {
      allQuotients.push({ value: q, partyIdx: pIdx, divisor: dIdx + 1 });
    });
  });

  // Sort descending
  allQuotients.sort((a, b) => b.value - a.value);

  // Take top totalMandates
  const winners = allQuotients.slice(0, totalMandates);
  const thresholdQuotient = winners[winners.length - 1]?.value || 0;

  // Count mandates per party
  const mandates = new Array(parties.length).fill(0);
  const mandateMatrix: boolean[][] = parties.map(() => 
    new Array(totalMandates).fill(false)
  );

  winners.forEach(w => {
    mandates[w.partyIdx]++;
    mandateMatrix[w.partyIdx][w.divisor - 1] = true;
  });

  return {
    quotients: quotients.map(pq => pq.map(q => q)),
    mandates,
    mandateMatrix,
    thresholdQuotient,
    totalVoted,
    totalInBox,
    totalInvalid,
    totalValid,
    percentVoted,
    partyPercentages,
  };
}

export const defaultElectionData: ElectionData = {
  municipality: "АРАНЂЕЛОВАЦ",
  totalVoters: 36763,
  totalMandates: 41,
  totalVoted: 26000,
  totalInBox: 25880,
  totalInvalid: 120,
  parties: [
    { name: "СНС", votes: 15000, isMinority: false, minorityCoefficient: 1 },
    { name: "Блокадери", votes: 8000, isMinority: false, minorityCoefficient: 1 },
    { name: "Наш покрет", votes: 1400, isMinority: false, minorityCoefficient: 1 },
    { name: "Мањина 1 (Руси)", votes: 740, isMinority: true, minorityCoefficient: 1.35 },
    { name: "Мањина 2 (Зелени)", votes: 740, isMinority: true, minorityCoefficient: 1.35 },
  ],
};
