import { MultiLanguage } from "dvote-js";

type Questions = Array<{
    id: number;
    title: MultiLanguage<string>;
    description?: MultiLanguage<string>;
    choices: Array<{
        id: number;
        title: MultiLanguage<string>;
        value: number;
    }>;
}>;

export const validateProcess = (questions: Questions): string | undefined => {
    const titleSizeAccepted = questions.filter(
        ({ title }) => new Blob([title.default]).size > 256
    );

    if (!!titleSizeAccepted.length) {
        return `Title of question ${titleSizeAccepted[0].id + 1} it's too big`;
    }

    const descriptionSizeAccepted = questions.filter(
        ({ description }) => new Blob([description.default]).size > 256
    );

    if (!!descriptionSizeAccepted.length) {
        return `Description of question ${
            descriptionSizeAccepted[0].id + 1
        } it's too big`;
    }

    const checkChoices = (question) => {
        const tooBigChoices = question.choices.map(
            ({ title }) => new Blob([title.default]).size > 256
        );
        if (!!tooBigChoices.length) {
            return tooBigChoices;
        }
    };

    const choiceSizeAccepted = questions.filter(checkChoices);

    if (!!choiceSizeAccepted.length) {
        const choiceNumber = choiceSizeAccepted[0].choices[0].id + 1;
        return `Choice number ${choiceNumber} of question ${
            choiceSizeAccepted[0].id + 1
        } is too big`;
    }

    const numberOfQuestionsAccepted = questions.length > 64;

    if (numberOfQuestionsAccepted) {
        return "Maximum number of questions supported is 64";
    }

    return undefined;
};
