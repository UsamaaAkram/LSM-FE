import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// #2 — the Community feed.

export type ReactionType =
  | "like"
  | "love"
  | "celebrate"
  | "applause"
  | "helpful";

export interface CommunityComment {
  _id?: string;
  author: string;
  authorName?: string;
  authorRole?: string;
  authorPhoto?: string;
  content: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface CommunityPost {
  _id: string;
  author: string;
  authorName?: string;
  authorRole?: string;
  authorPhoto?: string;
  category: string;
  content: string;
  attachments?: { url?: string; originalname?: string; mimetype?: string }[];
  mentions?: string[];
  reactions?: { user: string; type: ReactionType }[];
  comments?: CommunityComment[];
  isPinned?: boolean;
  isLocked?: boolean;
  editedAt?: string | null;
  createdAt?: string;
}

interface CommunityState {
  posts: CommunityPost[];
  categories: string[];
  loading: boolean;
  posting: boolean;
  error: string | null;
  /** false once a fetch returns fewer rows than asked for (#2.17). */
  hasMore: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/community";
const PAGE = 20;

const fail = (t: any, err: any, msg: string) =>
  t.rejectWithValue(err.response?.data?.error || msg);

export const fetchCommunityPosts = createAsyncThunk(
  "community/fetch",
  async (
    params: { category?: string; search?: string; before?: string } = {},
    thunkAPI
  ) => {
    try {
      const res = await axios.get(API_BASE, {
        params: { ...params, limit: PAGE },
      });
      return { posts: res.data, append: !!params.before };
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not load the community feed.");
    }
  }
);

export const fetchCommunityCategories = createAsyncThunk(
  "community/categories",
  async (_: void, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not load categories.");
    }
  }
);

export const createCommunityPost = createAsyncThunk(
  "community/create",
  async (
    payload: {
      author: string;
      authorName?: string;
      authorRole?: string;
      authorPhoto?: string;
      category: string;
      content: string;
      attachments?: File[];
    },
    thunkAPI
  ) => {
    try {
      const fd = new FormData();
      fd.append("author", payload.author);
      fd.append("authorName", payload.authorName ?? "");
      fd.append("authorRole", payload.authorRole ?? "");
      fd.append("authorPhoto", payload.authorPhoto ?? "");
      fd.append("category", payload.category);
      fd.append("content", payload.content);
      (payload.attachments || []).forEach((f) => fd.append("attachments", f));
      const res = await axios.post(API_BASE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not publish your post.");
    }
  }
);

export const reactToPost = createAsyncThunk(
  "community/react",
  async (
    { id, user, type }: { id: string; user: string; type: ReactionType },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(`${API_BASE}/${id}/react`, { user, type });
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not save your reaction.");
    }
  }
);

export const commentOnPost = createAsyncThunk(
  "community/comment",
  async (
    { id, ...body }: { id: string; author: string; authorName?: string; authorRole?: string; content: string },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(`${API_BASE}/${id}/comments`, body);
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not post your reply.");
    }
  }
);

export const deleteCommunityPost = createAsyncThunk(
  "community/delete",
  async ({ id, actor }: { id: string; actor: any }, thunkAPI) => {
    try {
      // Sent as query params: DELETE bodies aren't universally forwarded.
      await axios.delete(`${API_BASE}/${id}`, {
        params: { actorId: actor?.id, actorRole: actor?.role },
      });
      return id;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not delete the post.");
    }
  }
);

export const pinCommunityPost = createAsyncThunk(
  "community/pin",
  async (
    { id, pinned, actor }: { id: string; pinned: boolean; actor: any },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(`${API_BASE}/${id}/pin`, { pinned, actor });
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not update the pin.");
    }
  }
);

export const lockCommunityPost = createAsyncThunk(
  "community/lock",
  async (
    { id, locked, actor }: { id: string; locked: boolean; actor: any },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(`${API_BASE}/${id}/lock`, { locked, actor });
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not update the lock.");
    }
  }
);

const initialState: CommunityState = {
  posts: [],
  categories: [],
  loading: false,
  posting: false,
  error: null,
  hasMore: true,
};

const replace = (state: CommunityState, doc: CommunityPost) => {
  const i = state.posts.findIndex((p) => p._id === doc._id);
  if (i >= 0) state.posts[i] = doc;
};

const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {
    clearCommunityError: (state) => {
      state.error = null;
    },
    /**
     * #2.21 — a post arrived or changed over the socket. Insert or replace,
     * then keep pinned-first / newest-first ordering.
     *
     * Note this is intentionally id-keyed rather than "prepend": the same post
     * also arrives as the HTTP response to our own create, so a blind prepend
     * would show the author their post twice.
     */
    communityPostUpserted: (state, { payload }: { payload: CommunityPost }) => {
      const i = state.posts.findIndex((p) => p._id === payload._id);
      if (i >= 0) state.posts[i] = payload;
      else state.posts.push(payload);
      state.posts.sort((a, b) => {
        if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      });
    },
    communityPostRemoved: (state, { payload }: { payload: string }) => {
      state.posts = state.posts.filter((p) => p._id !== payload);
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCommunityPosts.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
      .addCase(fetchCommunityPosts.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { posts, append } = payload as any;
        // Appending can re-deliver a row if a post was created mid-scroll, so
        // de-duplicate by id rather than blindly concatenating.
        if (append) {
          const seen = new Set(state.posts.map((p) => p._id));
          state.posts = [
            ...state.posts,
            ...posts.filter((p: CommunityPost) => !seen.has(p._id)),
          ];
        } else {
          state.posts = posts;
        }
        state.hasMore = posts.length >= PAGE;
      })
      .addCase(fetchCommunityPosts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchCommunityCategories.fulfilled, (state, { payload }) => {
        state.categories = payload;
      })

      .addCase(createCommunityPost.pending, (state) => {
        state.posting = true;
        state.error = null;
      })
      .addCase(createCommunityPost.fulfilled, (state, { payload }) => {
        state.posting = false;
        // Newest first, but never above a pinned post.
        const firstUnpinned = state.posts.findIndex((p) => !p.isPinned);
        state.posts.splice(
          firstUnpinned === -1 ? state.posts.length : firstUnpinned,
          0,
          payload
        );
      })
      .addCase(createCommunityPost.rejected, (state, { payload }) => {
        state.posting = false;
        state.error = payload as string;
      })

      .addCase(deleteCommunityPost.fulfilled, (state, { payload }) => {
        state.posts = state.posts.filter((p) => p._id !== payload);
      })

      .addCase(reactToPost.fulfilled, (state, { payload }) => replace(state, payload))
      .addCase(commentOnPost.fulfilled, (state, { payload }) => replace(state, payload))
      .addCase(lockCommunityPost.fulfilled, (state, { payload }) => replace(state, payload))
      // Pinning changes sort order, so re-sort rather than swapping in place.
      .addCase(pinCommunityPost.fulfilled, (state, { payload }) => {
        replace(state, payload);
        state.posts.sort((a, b) => {
          if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
          return (
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
          );
        });
      })

      .addCase(reactToPost.rejected, (state, { payload }) => {
        state.error = payload as string;
      })
      .addCase(commentOnPost.rejected, (state, { payload }) => {
        state.error = payload as string;
      })
      .addCase(deleteCommunityPost.rejected, (state, { payload }) => {
        state.error = payload as string;
      })
      .addCase(pinCommunityPost.rejected, (state, { payload }) => {
        state.error = payload as string;
      })
      .addCase(lockCommunityPost.rejected, (state, { payload }) => {
        state.error = payload as string;
      });
  },
});

export const {
  clearCommunityError,
  communityPostUpserted,
  communityPostRemoved,
} = communitySlice.actions;
export default communitySlice.reducer;
