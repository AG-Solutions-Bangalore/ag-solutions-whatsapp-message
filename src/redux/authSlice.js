import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  name: null,
  user_type: null,
  id: null,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.name = action.payload.name;
      state.user_type = action.payload.user_type;
      state.id = action.payload.id;
      state.email = action.payload.email;
    },
    logout: (state) => {
      return initialState;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
