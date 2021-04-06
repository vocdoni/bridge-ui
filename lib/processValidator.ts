export const handleValidation = ({ title, description, choices }, index) => {
    const isLongTitle = new Blob([title.default]).size > 128
    if (isBigTitle) {
        throw new Error(`Title of  question #${index + 1} is too big`);
    }

    const isBigDescription = new Blob([description.default]).size > 256;
    if (isBigDescription) {
        throw new Error(`Description of  question #${index + 1} is too big`);
    }

    const choice = choices.findIndex(
        ({ title }) => new Blob([title.default]).size > 256
    );

    if (choice > -1) {
        throw new Error(
            `Choice #${choice + 1} of question #${index + 1} is too big`
        );
    }
};
