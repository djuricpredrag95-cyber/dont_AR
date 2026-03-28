// 2022 election results per polling station (NEW numbering)
// Old BM 13 → New BM 13 + 14 (combined data shown for both)
// Old BM 14+ → New BM 15+ (shifted by 1)

export interface Election2022Data {
  totalVoted: number;
  snsVotes: number;
}

// Raw data in OLD BM numbering
const OLD_DATA: Election2022Data[] = [
  { totalVoted: 1030, snsVotes: 411 },  // old 1
  { totalVoted: 989, snsVotes: 418 },   // old 2
  { totalVoted: 673, snsVotes: 234 },   // old 3
  { totalVoted: 789, snsVotes: 260 },   // old 4
  { totalVoted: 945, snsVotes: 336 },   // old 5
  { totalVoted: 718, snsVotes: 280 },   // old 6
  { totalVoted: 1049, snsVotes: 374 },  // old 7
  { totalVoted: 952, snsVotes: 292 },   // old 8
  { totalVoted: 964, snsVotes: 300 },   // old 9
  { totalVoted: 966, snsVotes: 380 },   // old 10
  { totalVoted: 649, snsVotes: 261 },   // old 11
  { totalVoted: 713, snsVotes: 266 },   // old 12
  { totalVoted: 1092, snsVotes: 395 },  // old 13 → new 13 + 14
  { totalVoted: 615, snsVotes: 165 },   // old 14 → new 15
  { totalVoted: 783, snsVotes: 338 },   // old 15 → new 16
  { totalVoted: 1056, snsVotes: 487 },  // old 16 → new 17
  { totalVoted: 920, snsVotes: 380 },   // old 17 → new 18
  { totalVoted: 487, snsVotes: 268 },   // old 18 → new 19
  { totalVoted: 621, snsVotes: 316 },   // old 19 → new 20
  { totalVoted: 207, snsVotes: 71 },    // old 20 → new 21
  { totalVoted: 341, snsVotes: 198 },   // old 21 → new 22
  { totalVoted: 721, snsVotes: 333 },   // old 22 → new 23
  { totalVoted: 479, snsVotes: 173 },   // old 23 → new 24
  { totalVoted: 354, snsVotes: 133 },   // old 24 → new 25
  { totalVoted: 227, snsVotes: 120 },   // old 25 → new 26
  { totalVoted: 141, snsVotes: 67 },    // old 26 → new 27
  { totalVoted: 218, snsVotes: 113 },   // old 27 → new 28
  { totalVoted: 241, snsVotes: 123 },   // old 28 → new 29
  { totalVoted: 186, snsVotes: 63 },    // old 29 → new 30
  { totalVoted: 462, snsVotes: 205 },   // old 30 → new 31
  { totalVoted: 372, snsVotes: 217 },   // old 31 → new 32
  { totalVoted: 698, snsVotes: 347 },   // old 32 → new 33
  { totalVoted: 380, snsVotes: 163 },   // old 33 → new 34
  { totalVoted: 265, snsVotes: 167 },   // old 34 → new 35
  { totalVoted: 475, snsVotes: 227 },   // old 35 → new 36
  { totalVoted: 355, snsVotes: 199 },   // old 36 → new 37
  { totalVoted: 577, snsVotes: 269 },   // old 37 → new 38
  { totalVoted: 256, snsVotes: 148 },   // old 38 → new 39
  { totalVoted: 689, snsVotes: 415 },   // old 39 → new 40
  { totalVoted: 151, snsVotes: 126 },   // old 40 → new 41
];

// Mapped to NEW BM numbering
export const ELECTION_2022: Record<number, Election2022Data> = {};

// Old 1-12 → New 1-12
for (let i = 0; i < 12; i++) {
  ELECTION_2022[i + 1] = OLD_DATA[i];
}

// Old 13 → New 13 + 14 (same combined data)
ELECTION_2022[13] = OLD_DATA[12];
ELECTION_2022[14] = OLD_DATA[12];

// Old 14-40 → New 15-41
for (let i = 13; i < 40; i++) {
  ELECTION_2022[i + 2] = OLD_DATA[i];
}
