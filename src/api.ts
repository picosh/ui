import {
  createApi,
  createSchema,
  createSelector,
  createThunks,
  mdw,
  put,
  slice,
} from "starfx";
import { TypedUseSelectorHook, useSelector as useSel } from "starfx/react";

const unknown = "unknown";
const now = new Date().toISOString();
const year = new Date(
  new Date().setFullYear(new Date().getFullYear() + 1),
).toISOString();
export const [schema, initialState] = createSchema({
  cache: slice.table(),
  loaders: slice.loaders(),
  user: slice.obj({
    user_id: "",
    username: unknown,
    pubkey: "SHA256:GpgLu/REpFbhrJrqzLDfnms5fKfCODbHo17Q1ZO/lLo",
  }),
  rssToken: slice.obj({
    id: "",
    name: unknown,
    created_at: now,
    expires_at: year,
  }),
  features: slice.table({
    empty: {
      id: "",
      name: unknown,
      created_at: now,
      expires_at: year,
      data: { storage_max: 0, file_max: 0 },
    },
  }),
});
export type WebState = typeof initialState;
type User = WebState["user"];
type Token = WebState["rssToken"];
type FeatureFlag = WebState["features"][string];

export const useSelector: TypedUseSelectorHook<WebState> = useSel;

export const thunks = createThunks();
thunks.use(function* (ctx, next) {
  yield* next();
  console.log("THUNK", ctx);
});
thunks.use(mdw.err);
thunks.use(mdw.loader(schema));
thunks.use(thunks.routes());

export const bootup = thunks.create("bootup", function* (_, next) {
  yield* put(fetchUser());
  yield* put(fetchFeatures());
  yield* next();
});

export const api = createApi();
api.use(function* (ctx, next) {
  yield* next();
  console.log("API", ctx);
});
api.use(mdw.api({ schema }));
api.use(api.routes());
api.use(mdw.fetch({ baseUrl: "localhost:5000" }));

export const selectHasRegistered = createSelector(
  schema.user.select,
  (user) => user.user_id !== "",
);

export const selectFeatureByName = createSelector(
  schema.features.selectTableAsList,
  (_: WebState, p: { name: string }) => p.name,
  (features, name) => features.find((ff) => ff.name === name),
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
    ctx.response = new Response(JSON.stringify({}), { status: 404 });
    // const mocked = { user_id: "123", username: "erock", pubkey: "whatever" };
    // ctx.response = new Response(JSON.stringify(mocked));
    yield* next();
  },
]);

export const registerUser = api.post<{ name: string }, User>("/users", [
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({ name: ctx.payload.name }),
    });
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.user.set(ctx.json.value));
  },
  function* (ctx, next) {
    const mocked = {
      user_id: "123",
      username: ctx.payload.name,
      pubkey: "whatever",
    };
    ctx.response = new Response(JSON.stringify(mocked));
    yield* next();
  },
]);

export const fetchFeatures = api.get<never, { features: FeatureFlag[] }>(
  "/features",
  [
    function* (ctx, next) {
      yield* next();
      if (!ctx.json.ok) {
        return;
      }

      const ff = ctx.json.value.features.reduce<Record<string, FeatureFlag>>(
        (acc, ff) => {
          acc[ff.id] = ff;
          return acc;
        },
        {},
      );
      yield* schema.update(schema.features.add(ff));
    },
    function* (ctx, next) {
      /*const data = JSON.stringify({
        features: [
          {
            id: "1",
            name: "pgs",
            created_at: now,
            expires_at: year,
            data: {
              storage_max: 10_000_000_000,
              file_max: 50_000_000,
            },
          },
        ],
      });
      ctx.response = new Response(data);*/
      ctx.response = new Response(JSON.stringify({ features: [] }));
      yield* next();
    },
  ],
);

export const fetchOrCreateToken = api.put<never, Token>("/rss-token", [
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
      expires_at: year,
    });
    ctx.response = new Response(data);
    yield* next();
  },
]);
