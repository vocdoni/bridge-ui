import { ProcessMetadata } from "dvote-js";
import moment from "moment";

const MAX_TITLE_LENGHT = 2048;
const MAX_DESCRIPTION_LENGTH = 4096;
const MAX_QUESTION_TITLE_LENGHT = 512;

export const validateProposal = (proposal: ProcessMetadata, startDate: Date, endDate: Date) => {
  
  if (!proposal.title || proposal.title.default.trim().length < 2)
    throw new Error("Please enter a title");

  if (!proposal.description || proposal.description.default.trim().length < 2)
    throw new Error("Please enter a description");
  
  const isLongTitle = new Blob([proposal.title.default]).size > MAX_TITLE_LENGHT;
  if (isLongTitle) {
    throw new Error(`Please make the title shorter than ${MAX_TITLE_LENGHT} characters`);
  }

  const isBigDescription = new Blob([proposal.description.default]).size > MAX_DESCRIPTION_LENGTH;
  if (isBigDescription) {
    throw new Error(`Please make the description shorter than ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  proposal.title.default = proposal.title.default.trim();
  proposal.description.default = proposal.description.default.trim();

  proposal.questions.map(validateQuestion);

  if (!startDate) throw new Error("Please enter a start date");
  else if (!endDate) throw new Error("Please enter an ending date");

  if (moment(startDate).isBefore(moment().add(5, "minutes"))) {
    throw new Error("The start date must be at least 5 minutes from now");
  } else if (moment(endDate).isBefore(moment().add(10, "minutes"))) {
    throw new Error("The end date must be at least 10 minutes from now");
  } else if (moment(endDate).isBefore(moment(startDate).add(5, "minutes"))) {
    throw new Error("The end date must be at least 5 minutes after the start");
  }

  for (let qIdx = 0; qIdx < proposal.questions.length; qIdx++) {
    const question = proposal.questions[qIdx];
    for (let cIdx = 0; cIdx < question.choices.length; cIdx++) {
      // Ensure values are unique and sequential
      question.choices[cIdx].value = cIdx;
    }
  }

}

export const validateQuestion = ({ title, description, choices }, index) => {  
    
  console.log(title)
  if (!title || title.default.trim().length < 2)
    throw new Error(`Please enter a title for question #${index + 1}`);

  const isLongTitle = new Blob([title.default]).size > MAX_TITLE_LENGHT;
  if (isLongTitle) {
    throw new Error(`The title for question #${index + 1} is too long. Please make it shorter than ${MAX_TITLE_LENGHT} characters`);
  }

  title.default = title.default.trim();

  const isBigDescription = new Blob([description.default]).size > MAX_DESCRIPTION_LENGTH;
  if (isBigDescription) {
    throw new Error(`The description of question #${index + 1} is too long. Please make it shorter than ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  if(description && description.default.trim().length >=2) {
    description.default = description.default.trim()
  }

  const choiceTooSmall = choices.findIndex(({ title }) => title.default.trim().length < 2);

  if (choiceTooSmall > -1) {
    throw new Error(`Please fill text for choice #${choiceTooSmall + 1} of question #${index + 1}`);
  }

  const choiceTooBig = choices.findIndex(({ title }) => new Blob([title.default]).size > MAX_QUESTION_TITLE_LENGHT);

  if (choiceTooBig > -1) {
    throw new Error(`The text for choice #${choiceTooBig + 1} of question #${index + 1} is too long. Please make it shorter than ${MAX_QUESTION_TITLE_LENGHT} characters`);
  }

  choices = choices.forEach(choice => {
    choice.title.default = choice.title.default.trim();
  });

};
