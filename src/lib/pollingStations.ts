export interface PollingStation {
  id: number;
  name: string;
  address: string;
  totalVoters: number;
}

export interface PollingStationData {
  stationId: number;
  totalVoted: number;
  totalInBox: number;
  totalInvalid: number;
  partyVotes: number[]; // votes per party in order
}

export const PARTIES = [
  { name: "СНС", isMinority: false, minorityCoefficient: 1 },
  { name: "Руска странка", isMinority: true, minorityCoefficient: 1.35 },
  { name: "Студенти", isMinority: false, minorityCoefficient: 1 },
  { name: "381", isMinority: true, minorityCoefficient: 1.35 },
  { name: "Зелени", isMinority: false, minorityCoefficient: 1 },
] as const;

export const POLLING_STATIONS: PollingStation[] = [
  { id: 1, name: 'ОШ "СВЕТИ САВА"', address: "АРАНЂЕЛОВАЦ, НИКОЛЕ ПАШИЋА БР. 66", totalVoters: 1619 },
  { id: 2, name: 'ОШ "СВЕТИ САВА"', address: "АРАНЂЕЛОВАЦ, НИКОЛЕ ПАШИЋА БР. 66", totalVoters: 1565 },
  { id: 3, name: 'ОШ "СВЕТОЛИК РАНКОВИЋ"', address: "АРАНЂЕЛОВАЦ, МИЛОВАНА РИСТИЋА БР. 1", totalVoters: 1105 },
  { id: 4, name: 'ОШ "СВЕТОЛИК РАНКОВИЋ"', address: "АРАНЂЕЛОВАЦ, МИЛОВАНА РИСТИЋА БР. 1", totalVoters: 1186 },
  { id: 5, name: 'ВРТИЋ „СУНЦЕ"', address: "АРАНЂЕЛОВАЦ, РАТНИХ ВОЈНИХ ИНВАЛИДА БР. 10", totalVoters: 1623 },
  { id: 6, name: "АУТОБУСКА СТАНИЦА", address: "АРАНЂЕЛОВАЦ, КНЕЗА МИХАИЛА БР. 104", totalVoters: 1163 },
  { id: 7, name: 'ОШ "ИЛИЈА ГАРАШАНИН"', address: "АРАНЂЕЛОВАЦ, ЈОСИФА ПАНЧИЋА БР. 5", totalVoters: 1660 },
  { id: 8, name: "ЗГРАДА СКУПШТИНЕ ОПШТИНЕ", address: "АРАНЂЕЛОВАЦ, ВЕНАЦ СЛОБОДЕ БР. 10", totalVoters: 1312 },
  { id: 9, name: "ЗГРАДА ОСНОВНОГ СУДА", address: "АРАНЂЕЛОВАЦ, КЊАЗА МИЛОША БР. 102", totalVoters: 1476 },
  { id: 10, name: "ДОМ ОМЛАДИНЕ", address: "АРАНЂЕЛОВАЦ, ЈОСИПА ГРУШОВНИКА БР. 1", totalVoters: 1558 },
  { id: 11, name: "АУТО-МОТО ДРУШТВО", address: "АРАНЂЕЛОВАЦ, ЗАНАТЛИЈСКА БР. 47", totalVoters: 1054 },
  { id: 12, name: '"КОЛЕКТИВ"', address: "АРАНЂЕЛОВАЦ, КЊАЗА МИЛОША БР. 74", totalVoters: 1194 },
  { id: 13, name: "ФОНД ЗДРАВСТВА", address: "АРАНЂЕЛОВАЦ, КРАЉА ПЕТРА ПРВОГ БР. 54", totalVoters: 891 },
  { id: 14, name: "УДРУЖЕЊЕ ПЕНЗИОНЕРА", address: "АРАНЂЕЛОВАЦ, КРАЉА ПЕТРА ПРВОГ БР. 34", totalVoters: 996 },
  { id: 15, name: 'ОДМАРАЛИШТЕ "ИНО"', address: "АРАНЂЕЛОВАЦ, ВОЈВОДЕ ПУТНИКА БР. 4", totalVoters: 907 },
  { id: 16, name: "МЕСНА КАНЦЕЛАРИЈА ВРБИЦА", address: "АРАНЂЕЛОВАЦ, ЗАНАТЛИЈСКА БР. 82", totalVoters: 1244 },
  { id: 17, name: 'МПИ "ПОБЕДА"', address: "АРАНЂЕЛОВАЦ, КРАЉА АЛЕКСАНДРА БР. 36", totalVoters: 1589 },
  { id: 18, name: 'ОШ "МИЛОШ ОБРЕНОВИЋ"', address: "АРАНЂЕЛОВАЦ, СВЕТОГОРСКА БР. 2", totalVoters: 1530 },
  { id: 19, name: "ОСНОВНА ШКОЛА У МАРИНОВЦУ", address: "БАЊА", totalVoters: 745 },
  { id: 20, name: "МЕСНА КАНЦЕЛАРИЈА", address: "БАЊА", totalVoters: 989 },
  { id: 21, name: "МЕСНА КАНЦЕЛАРИЈА", address: "БОСУТА", totalVoters: 294 },
  { id: 22, name: "ДОМ КУЛТУРЕ", address: "БРЕЗОВАЦ", totalVoters: 507 },
  { id: 23, name: "ДОМ КУЛТУРЕ", address: "БУКОВИК", totalVoters: 1267 },
  { id: 24, name: "ОСНОВНА ШКОЛА", address: "БУКОВИК", totalVoters: 847 },
  { id: 25, name: "ДОМ КУЛТУРЕ", address: "ВЕНЧАНИ", totalVoters: 521 },
  { id: 26, name: 'ОСНОВНА ШКОЛА „ВЕЉА ГЕРАСИМОВИЋ"', address: "ВЕНЧАНИ", totalVoters: 268 },
  { id: 27, name: "ОСНОВНА ШКОЛА", address: "ВУКОСАВЦИ", totalVoters: 194 },
  { id: 28, name: "МЕСНА КАНЦЕЛАРИЈА", address: "ГАРАШИ", totalVoters: 352 },
  { id: 29, name: "ОСНОВНА ШКОЛА", address: "ГОРЊА ТРЕШЊЕВИЦА", totalVoters: 329 },
  { id: 30, name: "МЕСНА ЗАЈЕДНИЦА", address: "ЈЕЛОВИК", totalVoters: 260 },
  { id: 31, name: "ДОМ КУЛТУРЕ", address: "КОПЉАРИ", totalVoters: 699 },
  { id: 32, name: "ДОМ КУЛТУРЕ", address: "МИСАЧА", totalVoters: 539 },
  { id: 33, name: "ДОМ КУЛТУРЕ", address: "ДАРОСАВА", totalVoters: 959 },
  { id: 34, name: "ОСНОВНА ШКОЛА", address: "ДАРОСАВА", totalVoters: 581 },
  { id: 35, name: "ДОМ КУЛТУРЕ", address: "ПРОГОРЕОЦИ", totalVoters: 416 },
  { id: 36, name: "ОСНОВНА ШКОЛА", address: "РАНИЛОВИЋ", totalVoters: 630 },
  { id: 37, name: "АМБУЛАНТА РАНИЛОВИЋ", address: "РАНИЛОВИЋ", totalVoters: 485 },
  { id: 38, name: "ДОМ КУЛТУРЕ", address: "СТОЈНИК", totalVoters: 762 },
  { id: 39, name: "ДОМ КУЛТУРЕ", address: "ТУЛЕЖ", totalVoters: 355 },
  { id: 40, name: "ДОМ КУЛТУРЕ", address: "ОРАШАЦ", totalVoters: 1008 },
  { id: 41, name: "КУЋА ДОБРИЦЕ ЈОКСИМОВИЋА", address: "ОРАШАЦ", totalVoters: 162 },
];
