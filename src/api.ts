import { createApi, createThunks, mdw, put } from "starfx";
import { TypedUseSelectorHook, useSelector as useSel } from "starfx/react";
import { createSchema, createSelector, slice, storeMdw } from "starfx/store";

const now = new Date().toISOString();
export const [schema, initialState] = createSchema({
  cache: slice.table(),
  loaders: slice.loaders(),
  user: slice.obj({ user_id: "", username: "", pubkey: "" }),
  rssToken: slice.obj(
    { id: "", name: "", created_at: now, expires_at: now },
  ),
});
export type WebState = typeof initialState;
type User = WebState["user"];
type Token = WebState["rssToken"];

export const useSelector: TypedUseSelectorHook<WebState> = useSel;

export const thunks = createThunks();
thunks.use(mdw.err);
thunks.use(storeMdw.loader(schema.loaders));
thunks.use(thunks.routes());

export const bootup = thunks.create("bootup", function* (_, next) {
  yield* put(fetchUser());
  yield* next();
});

export const api = createApi();
api.use(mdw.api());
api.use(storeMdw.store(schema));
api.use(api.routes());
api.use(mdw.fetch({ baseUrl: "localhost:5000" }));

export const selectHasRegistered = createSelector(
  schema.user.select,
  (user) => user.username !== "",
);

export const fetchUser = api.get<never, User>("/pico", [
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.user.set(ctx.json.value));
  },
  function* (ctx, next) {
    // ctx.response = new Response("", { status: 404 });
    const mocked = { user_id: "123", username: "erock", pubkey: "whatever" };
    ctx.response = new Response(JSON.stringify(mocked));
    yield* next();
  },
]);

export const registerUser = api.post<{ name: string }, User>("/users/:name", [
  function* (ctx, next) {
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.user.set(ctx.json.value));
  },
  function* (ctx, next) {
    const mocked = { user_id: "123", username: "erock", pubkey: "whatever" };
    ctx.response = new Response(JSON.stringify(mocked));
    yield* next();
  },
]);

export const createToken = api.put<never, Token>("/rss-token", [
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    const token = ctx.json.value;
    yield* schema.update(schema.rssToken.set(token));
  },
  function* (ctx, next) {
    const data = JSON.stringify({
      id: "333",
      name: "pico-rss",
      created_at: now,
      expires_at: now,
    });
    ctx.response = new Response(data);
    yield* next();
  },
]);
