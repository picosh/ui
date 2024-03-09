import {
  ApiCtx,
  Next,
  createApi,
  createSchema,
  createSelector,
  createThunks,
  mdw,
  put,
  slice,
} from "starfx";
import { TypedUseSelectorHook, useSelector as useSel } from "starfx/react";

function mockMdw(data: any, status = 200) {
  return function* (ctx: ApiCtx, next: Next) {
    const isDev = import.meta.env.DEV;
    if (isDev) {
      yield* next();
      return;
    }

    ctx.response = new Response(JSON.stringify(data), { status });
    yield* next();
  };
}

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
  rssToken: slice.str(),
  tokens: slice.table({
    empty: { id: "", name: unknown, created_at: now, expires_at: year },
  }),
  pubkeys: slice.table({ empty: { id: "", key: "", created_at: now } }),
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
export type User = WebState["user"];
export type Token = WebState["tokens"][string];
export type Pubkey = WebState["pubkeys"][string];
export type FeatureFlag = WebState["features"][string];

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
api.use(function* (ctx, next) {
  ctx.request = ctx.req({
    headers: {
      "Content-Type": "application/json",
    },
  });
  yield* next();
});
api.use(mdw.fetch({ baseUrl: `${location.origin}/api` }));
// api.use(mdw.fetch({ baseUrl: "http://localhost:5000/api" }));

export const selectHasRegistered = createSelector(
  schema.user.select,
  (user) => user.user_id !== "",
);

export const selectFeatureByName = createSelector(
  schema.features.selectTableAsList,
  (_: WebState, p: { name: string }) => p.name,
  (features, name) => features.find((ff) => ff.name === name),
);

export const fetchUser = api.get<never, User>("/current_user", [
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.user.set(ctx.json.value));
  },
  mockMdw({}, 404),
  // mockMdw({ user_id: "123", username: "erock", pubkey: "whatever" })
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
    const mock = mockMdw({
      user_id: "123",
      username: ctx.payload.name,
      pubkey: "whatever",
    });
    yield* mock(ctx, next);
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
    mockMdw({ features: [] }),
    /*
    mockMdw({
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
    }),
    */
  ],
);

export const fetchOrCreateToken = api.put<never, { token: string }>(
  "/rss-token",
  [
    function* (ctx, next) {
      yield* next();
      if (!ctx.json.ok) {
        return;
      }

      const value = ctx.json.value;
      yield* schema.update(schema.rssToken.set(value.token));
    },
    mockMdw({
      token: "asbcasasd",
    }),
  ],
);

export const fetchPubkeys = api.get<never, { pubkeys: Pubkey[] }>("/pubkeys", [
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    const pubkeys = ctx.json.value.pubkeys.reduce<Record<string, Pubkey>>(
      (acc, pk) => {
        acc[pk.id] = pk;
        return acc;
      },
      {},
    );
    yield* schema.update(schema.pubkeys.set(pubkeys));
  },
  mockMdw({
    pubkeys: [{ id: "1111", key: "xxx", created_at: now }],
  }),
]);

export const fetchTokens = api.get<never, { tokens: Token[] }>("/tokens", [
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    const tokens = ctx.json.value.tokens.reduce<Record<string, Token>>(
      (acc, pk) => {
        acc[pk.id] = pk;
        return acc;
      },
      {},
    );
    yield* schema.update(schema.tokens.set(tokens));
  },
  mockMdw({
    tokens: [{ id: "2222", name: "chat", created_at: now, expires_at: year }],
  }),
]);
