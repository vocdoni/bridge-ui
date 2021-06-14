export const INVALID_CHAIN_ID = "Invalid chain ID";
export const METAMASK_IS_NOT_AVAILABLE = "Metamask is not available";
export const YOU_ARE_NOT_CONNECTED = "You are not connected";
export const NO_TOKEN_BALANCE = "You have no token balance";
export const TOKEN_ALREADY_REGISTERED = "The token is already registered";
export const TOKEN_ADDRESS_INVALID = "The token address is not valid";
export const USER_CANCELED_TX = "The transaction was canceled";

class NoTokenBalanceError extends Error {
  constructor() {
    super("You have no token balance");
  }
}

// NEW PROPOSAL FORMAT ===================================================================

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
