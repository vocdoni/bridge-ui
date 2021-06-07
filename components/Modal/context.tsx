import React, { createContext, Dispatch, useContext, useReducer } from "react";
import { WalletList } from "./WalletList";

export enum ActionTypes {
  OPEN_WALLET_LIST = "OPEN_WALLET_LIST",
  OPEN_PROPOSAL_LIST = "OPEN_PROPOSAL_LIST",
  CLOSE_PROPOSAL_LIST = "CLOSE_PROPOSAL_LIST",
  CLOSE_WALLET_LIST = "CLOSE_WALLET_LIST",
}

type ProposalListAction = {
  type: ActionTypes.OPEN_PROPOSAL_LIST;
};

type WalletListAction = {
  type: ActionTypes.OPEN_WALLET_LIST;
};

type CloseWalletAction = {
  type: ActionTypes.CLOSE_WALLET_LIST;
};

type CloseProposalAction = {
  type: ActionTypes.CLOSE_PROPOSAL_LIST;
};

type ModalsContextAction =
  | WalletListAction
  | ProposalListAction
  | CloseWalletAction
  | CloseProposalAction;

interface ModalContextState {
  walletList: {
    open: boolean;
  };
  proposalList: {
    open: boolean;
  };
}

interface ModalContext {
  state: ModalContextState;
  dispatch: Dispatch<ModalsContextAction>;
}

const INITIAL_STATE: ModalContextState = {
  walletList: {
    open: false,
  },
  proposalList: {
    open: false,
  },
};

const ModalsContext = createContext<ModalContext>({
  state: INITIAL_STATE,
  dispatch: () => null,
});

const reducer = (state: ModalContextState, action: ModalsContextAction): ModalContextState => {
  switch (action.type) {
    case ActionTypes.OPEN_PROPOSAL_LIST:
      return {
        ...state,
        proposalList: { open: true },
      };
    case ActionTypes.OPEN_WALLET_LIST:
      return {
        ...state,
        walletList: { open: true },
      };
    case ActionTypes.CLOSE_PROPOSAL_LIST:
      return {
        ...state,
        proposalList: { open: false },
      };
    case ActionTypes.CLOSE_WALLET_LIST:
      return {
        ...state,
        walletList: { open: false },
      };
    default:
      throw new Error(`Unrecognized action in Modals Provider`);
  }
};

export const ModalsProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  return (
    <ModalsContext.Provider value={{ state, dispatch }}>
      {children}
      <WalletList />
    </ModalsContext.Provider>
  );
};

export const useModal = () => useContext(ModalsContext);
