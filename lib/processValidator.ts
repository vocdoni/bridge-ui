export const handleValidation = ({ title, description, choices }, index) => {
    const isLongTitle = new Blob([title.default]).size > 128
    if (isBigTitle) {
        throw new Error(`The title for question #${index + 1} is too long`);
    }

    const isBigDescription = new Blob([description.default]).size > 1024;
    if (isBigDescription) {
        throw new Error(`The description of question #${index + 1} is too long`);
    }

    const choice = choices.findIndex(
        ({ title }) => new Blob([title.default]).size > 32
    );

    if (choice > -1) {
        throw new Error(
            `The text for choice #${choice + 1} of question #${index + 1} is too long`
        );
    }
};
