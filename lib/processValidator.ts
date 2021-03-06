import { ProcessMetadata } from "dvote-js";
import moment from "moment";
import {
  DateError,
  DateErrorType,
  ShortInputError,
  LongInputError,
  InputType,
  MissingInputError,
  ShortChoiceError,
  LongChoiceError,
} from "./errors";

const MAX_TITLE_LENGHT = 2048;
const MAX_DESCRIPTION_LENGTH = 4096;
const MAX_QUESTION_TITLE_LENGHT = 512;
const MIN_INPUT_LENGTH = 2;

export const validateProposal = (proposal: ProcessMetadata, startDate: Date, endDate: Date) => {
  if (!proposal?.title?.default) throw new MissingInputError(InputType.TITLE);

  const trimmedTitle = proposal.title.default.trim();
  if (isShortInput(trimmedTitle)) throw new ShortInputError(InputType.TITLE);

  if (!proposal?.description?.default) throw new MissingInputError(InputType.DESCRIPTION);

  const trimmedDescription = proposal.description.default.trim();
  if (isShortInput(trimmedDescription)) throw new ShortInputError(InputType.DESCRIPTION);

  const isLongTitle = new Blob([trimmedTitle]).size > MAX_TITLE_LENGHT;
  if (isLongTitle) throw new LongInputError(InputType.TITLE, MAX_TITLE_LENGHT);

  const isBigDescription = new Blob([trimmedDescription]).size > MAX_DESCRIPTION_LENGTH;
  if (isBigDescription) throw new LongInputError(InputType.DESCRIPTION, MAX_DESCRIPTION_LENGTH);

  proposal.title.default = trimmedTitle;
  proposal.description.default = trimmedDescription;

  proposal.questions.forEach(validateQuestion);

  if (!startDate) throw new MissingInputError(InputType.START_DATE);
  if (!endDate) throw new MissingInputError(InputType.END_DATE);

  if (moment(startDate).isBefore(moment().add(5, "minutes"))) {
    throw new DateError(DateErrorType.EARLY_START);
  } else if (moment(endDate).isBefore(moment().add(10, "minutes"))) {
    throw new DateError(DateErrorType.EARLY_END);
  } else if (moment(endDate).isBefore(moment(startDate).add(5, "minutes"))) {
    throw new DateError(DateErrorType.SMALL_INTERVAL);
  }

  for (let qIdx = 0; qIdx < proposal.questions.length; qIdx++) {
    const question = proposal.questions[qIdx];
    for (let cIdx = 0; cIdx < question.choices.length; cIdx++) {
      // Ensure values are unique and sequential
      question.choices[cIdx].value = cIdx;
    }
  }
};

type QuestionMetadata = ProcessMetadata["questions"][number];

export const validateQuestion = (
  { title, description, choices }: QuestionMetadata,
  index: number
) => {
  if (!title?.default) throw new MissingInputError(InputType.TITLE, index);

  const trimmedTitle = title.default.trim();
  if (isShortInput(trimmedTitle)) throw new ShortInputError(InputType.TITLE, index);

  const isLongTitle = new Blob([trimmedTitle]).size > MAX_TITLE_LENGHT;
  if (isLongTitle) throw new LongInputError(InputType.TITLE, MAX_TITLE_LENGHT, index);
  title.default = trimmedTitle;

  if (description?.default) {
    const trimmedDescription = description.default.trim();
    const isBigDescription = new Blob([trimmedDescription]).size > MAX_DESCRIPTION_LENGTH;
    if (isBigDescription) {
      throw new LongInputError(InputType.DESCRIPTION, MAX_DESCRIPTION_LENGTH, index);
    }
  }

  let hasFaultyChoice = choices.some(({ title }) => title.default.trim().length < MIN_INPUT_LENGTH);
  if (hasFaultyChoice) throw new ShortChoiceError(hasFaultyChoice, index);

  hasFaultyChoice = choices.some(
    ({ title }) => new Blob([title.default]).size > MAX_QUESTION_TITLE_LENGHT
  );
  if (hasFaultyChoice) {
    throw new LongChoiceError(hasFaultyChoice, index, MAX_QUESTION_TITLE_LENGHT);
  }

  choices.forEach((choice) => {
    choice.title.default = choice.title.default.trim();
  });
};

const isShortInput = (input: string) => input.length < MIN_INPUT_LENGTH;
