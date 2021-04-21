import React, { createContext, Dispatch, useContext, useReducer } from "react";
import { WalletList } from "./WalletList";

export enum ActionTypes {
  OPEN_WALLET_LIST = "OPEN_WALLET_LIST",
  CLOSE = "CLOSE",
}

type WalletListAction = {
  type: ActionTypes.OPEN_WALLET_LIST;
};

type CloseAction = {
  type: ActionTypes.CLOSE;
};

type ModalsContextAction = WalletListAction | CloseAction;

interface ModalContextState {
  walletList: {
    open: boolean;
  };
}

interface Context {
  state: ModalContextState;
  dispatch: Dispatch<ModalsContextAction>;
}

const INITIAL_STATE: ModalContextState = {
  walletList: {
    open: false,
  },
};

const ModalsContext = createContext<Context>({
  state: INITIAL_STATE,
  dispatch: () => null,
});

const reducer = (state: ModalContextState, action: ModalsContextAction): ModalContextState => {
  switch (action.type) {
    case ActionTypes.OPEN_WALLET_LIST:
      return {
        ...state,
        walletList: { open: !state.walletList.open },
      };
    case ActionTypes.CLOSE:
      return INITIAL_STATE;
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
