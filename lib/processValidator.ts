import { MultiLanguage } from "dvote-js";

type Questions = {
    title: MultiLanguage<string>;
    description?: MultiLanguage<string>;
    choices: {
        title: MultiLanguage<string>;
        value: number;
    }[];
}[];

const checkTitles = (previousValue, question, index) => {
    const isBig = new Blob([question.title.default]).size > 256;
    if (isBig) {
        return {
            hasErrors: true,
            message: `Title of  question #${index + 1} is too big`,
        };
    }

    return previousValue;
};

const checkDescriptions = (previousValue, question, index) => {
    const isBig = new Blob([question.description.default]).size > 256;
    if (isBig) {
        return {
            hasErrors: true,
            message: `Description of  question #${index + 1} is too big`,
        };
    }

    return previousValue;
};

const checkChoices = (previousValue, { choices }, questionIndex) => {
    const isBig = (title) => new Blob([title]).size > 256;
    const choice = choices.findIndex(({ title }) => isBig(title.default));

    if (choice > -1) {
        return {
            hasErrors: true,
            message: `Choice #${choice + 1} of question #${questionIndex + 1} is too big`,
        };
    }

    return previousValue;
};

export const validateProcess = (questions: Questions): string | undefined => {
    const titles = questions.reduce(checkTitles, { hasErrors: false });
    if (titles.hasErrors) return titles.message;

    const descriptions = questions.reduce(checkDescriptions, {
        hasErrors: false,
    });
    if (descriptions.hasErrors) return descriptions.message;

    const choices = questions.reduce(checkChoices, { hasErrors: false });
    if (choices.hasErrors) return choices.message;

    const numberOfQuestionsAccepted = questions.length > 64;
    if (numberOfQuestionsAccepted) {
        return "Maximum number of questions supported is 64";
    }

    return undefined;
};
