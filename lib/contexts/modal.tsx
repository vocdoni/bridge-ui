import React, { createContext, Dispatch, useContext, useReducer } from "react";

export enum ActionTypes {
  OPEN_PROPOSAL_LIST = "OPEN_PROPOSAL_LIST",
  CLOSE_PROPOSAL_LIST = "CLOSE_PROPOSAL_LIST",
}

type ProposalListAction = {
  type: ActionTypes.OPEN_PROPOSAL_LIST;
};

type CloseProposalAction = {
  type: ActionTypes.CLOSE_PROPOSAL_LIST;
};

type ModalsContextAction = ProposalListAction | CloseProposalAction;

interface ModalContextState {
  proposalList: {
    open: boolean;
  };
}

interface ModalContext {
  state: ModalContextState;
  dispatch: Dispatch<ModalsContextAction>;
}

const INITIAL_STATE: ModalContextState = {
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
    case ActionTypes.CLOSE_PROPOSAL_LIST:
      return {
        ...state,
        proposalList: { open: false },
      };
    default:
      throw new Error(`Unrecognized action in Modals Provider`);
  }
};

export const ModalsProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  return <ModalsContext.Provider value={{ state, dispatch }}>{children}</ModalsContext.Provider>;
};

export const useModal = () => useContext(ModalsContext);
