// store.js
import { configureStore } from '@reduxjs/toolkit';

const initialState = {
  transactionStatus: { success: null, message: "", transactionHash: "" },
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_TRANSACTION_STATUS':
      return {
        ...state,
        transactionStatus: action.payload,
      };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
