import { BigNumber } from "@ethersproject/bignumber";


export const MOCK_STATS = [
  {
    description: "Status",
    value: "50s",
  },
  {
    description: "ZRK Used",
    value: "61k",
  },
  {
    description: "Turnout",
    value: "0%",
  },
  {
    description: "ZRK Used",
    value: "58",
  },
];

export const MOCK_QUESTIONS = [
  {
    title: "Do you approve a minting of 900.000 new MKR Tokens?",
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
    ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
    ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
    results: [
      {
        title: "First",
        votes: BigNumber.from(10),
      },
      {
        title: "Second",
        votes: BigNumber.from(100),
      },
    ],
  },
  {
    title: "Do you approve a minting of 900.000 new MKR Tokens?",
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
    ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
    ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
    results: [
      {
        title: "First",
        votes: BigNumber.from(10),
      },
      {
        title: "Second",
        votes: BigNumber.from(100),
      },
    ],
  },
];
