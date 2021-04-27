import { BigNumber } from "@ethersproject/bignumber";

export const processState = () => {};

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
    title: "This is the title",
    description: "This is the description",
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
