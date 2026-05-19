import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatUserApi from '../common/api/chatUserApi';

export interface ChatUser {
  _id: string;
  name: string;
  role: string;
  photo: string;
}

interface ChatUserState {
  users: ChatUser[];
  loading: boolean;
}

const initialState: ChatUserState = {
  users: [],
  loading: false
};

export const fetchAllChatUsers = createAsyncThunk(
  'chatUser/fetchAllChatUsers',
  async () => await chatUserApi.fetchAllChatUsers()
);

const chatUserSlice = createSlice({
  name: 'chatUser',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAllChatUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllChatUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllChatUsers.rejected, (state) => { state.loading = false; });
  }
});

export default chatUserSlice.reducer;