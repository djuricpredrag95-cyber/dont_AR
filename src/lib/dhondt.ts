export interface Party {
  name: string;
  votes: number;
  isMinority: boolean;
  minorityCoefficient: number;
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
  quotients: number[][];
  mandates: number[];
  mandateMatrix: boolean[][];
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

  const quotients: number[][] = parties.map((party) => {
    const result: number[] = [];
    for (let d = 1; d <= totalMandates; d++) {
      result.push((party.votes * party.minorityCoefficient) / d);
    }
    return result;
  });

  const allQuotients: { value: number; partyIdx: number; divisor: number }[] = [];
  quotients.forEach((partyQ, pIdx) => {
    partyQ.forEach((q, dIdx) => {
      allQuotients.push({ value: q, partyIdx: pIdx, divisor: dIdx + 1 });
    });
  });

  allQuotients.sort((a, b) => b.value - a.value);
  const winners = allQuotients.slice(0, totalMandates);
  const thresholdQuotient = winners[winners.length - 1]?.value || 0;

  const mandates = new Array(parties.length).fill(0);
  const mandateMatrix: boolean[][] = parties.map(() => new Array(totalMandates).fill(false));

  winners.forEach(w => {
    mandates[w.partyIdx]++;
    mandateMatrix[w.partyIdx][w.divisor - 1] = true;
  });

  return {
    quotients: quotients.map(pq => [...pq]),
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
  totalVoters: 36841,
  totalMandates: 41,
  totalVoted: 0,
  totalInBox: 0,
  totalInvalid: 0,
  parties: [
    { name: "СНС", votes: 0, isMinority: false, minorityCoefficient: 1 },
    { name: "Руска странка", votes: 0, isMinority: true, minorityCoefficient: 1.35 },
    { name: "Студенти", votes: 0, isMinority: false, minorityCoefficient: 1 },
    { name: "381", votes: 0, isMinority: true, minorityCoefficient: 1.35 },
    { name: "Зелени", votes: 0, isMinority: false, minorityCoefficient: 1 },
  ],
};
