export const NO_TOKEN_BALANCE = "You have no token balance";
export const USER_CANCELED_TX = "The transaction was canceled";

// TOKEN ERRORS ==========================================================================

export class NoTokenBalanceError extends Error {
  constructor(tokenSymbol: string = "") {
    if (!tokenSymbol) super(`You have no token balance`);
    else super(`You have no balance for token ${tokenSymbol}`);
  }
}

export class TokenAlreadyRegisteredError extends Error {
  constructor(tokenSymbol: string = "") {
    if (!tokenSymbol) super(`The token is already registered`);
    else super(`The ${tokenSymbol} token is already registered`);
  }
}

export class TokenAddressInvalid extends Error {
  constructor() {
    super("The token address is not valid");
  }
}

// NEW PROPOSAL FORMAT ERROR =============================================================

export enum InputType {
  TITLE = "title",
  DESCRIPTION = "description",
  START_DATE = "start date",
  END_DATE = "end date",
}

export class MissingInputError extends Error {
  constructor(inputType: InputType, index = -1) {
    if (index < 0) super(`Please enter a ${inputType}`);
    else super(`Please enter a ${inputType} for question #${index + 1}`);
  }
}

export class ShortInputError extends Error {
  constructor(inputType: InputType, index: number = -1) {
    if (index < 0) super(`Please enter a longer ${inputType}`);
    else super(`Please enter a longer ${inputType} for question #${index + 1}`);
  }
}

export class LongInputError extends Error {
  constructor(inputType: InputType, maxLength: number, index: number = -1) {
    if (index < 0) {
      super(`The ${inputType} is too long. Please keep it shorter than ${maxLength} characters`);
    } else {
      super(
        `The ${inputType} for question #${
          index + 1
        } is too long. Please keep it shorter than ${maxLength} characters`
      );
    }
  }
}

export class ShortChoiceError extends Error {
  constructor(choiceIndex, questionIndex) {
    super(`Please fill text for choice #${choiceIndex + 1} of question #${questionIndex + 1}`);
  }
}

export class LongChoiceError extends Error {
  constructor(choiceIndex, questionIndex, maxLength) {
    super(
      `The text for choice #${choiceIndex + 1} of question #${
        questionIndex + 1
      } is too long. Please make it shorter than ${maxLength} characters`
    );
  }
}

export enum DateErrorType {
  EARLY_START,
  EARLY_END,
  SMALL_INTERVAL,
}

export class DateError extends Error {
  constructor(errorType: DateErrorType) {
    let errorMsg;
    switch (errorType) {
      case DateErrorType.EARLY_START:
        errorMsg = "The start date must be at least 5 minutes from now";
        break;
      case DateErrorType.EARLY_END:
        errorMsg = "The end date must be at least 10 minutes from now";
        break;
      case DateErrorType.SMALL_INTERVAL:
        errorMsg = "The end date must be at least 5 minutes after the start";
        break;
      default:
        errorMsg = "Date error not properly set.";
        break;
    }
    super(errorMsg);
  }
}
