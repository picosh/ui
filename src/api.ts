import {
  ApiCtx,
  Next,
  createApi,
  createSchema,
  createSelector,
  createThunks,
  mdw,
  put,
  select,
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
  config: slice.obj({
    mockApi: import.meta.env.VITE_MOCK_API || "false",
    apiUrl: import.meta.env.VITE_API_URL || `${location.origin}/api`,
  }),
  user: slice.obj({
    id: "",
    name: unknown,
    fingerprint: "SHA256:GpgLu/REpFbhrJrqzLDfnms5fKfCODbHo17Q1ZO/lLo",
    created_at: now,
  }),
  rssToken: slice.str(),
  tokens: slice.table({
    empty: { id: "", name: unknown, created_at: now, expires_at: year },
  }),
  pubkeys: slice.table({
    empty: { id: "", name: unknown, key: "", created_at: now },
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
  posts: slice.table({
    empty: {
      id: "",
      title: "",
      text: "",
      publish_at: now,
      created_at: now,
      updated_at: now,
      expires_at: now,
      description: "",
      filename: "",
      hidden: false,
      space: "",
      views: 0,
      slug: "",
      file_size: 0,
      mime_type: "",
      shasum: "",
      data: {},
    },
  }),
  projects: slice.table({
    empty: {
      id: "",
      name: unknown,
      project_dir: "",
      created_at: now,
      updated_at: now,
      acl: { data: [], type: "" },
    },
  }),
});
export type WebState = typeof initialState;
export type User = WebState["user"];
export type Token = WebState["tokens"][string];
export type Pubkey = WebState["pubkeys"][string];
export type FeatureFlag = WebState["features"][string];
export type Post = WebState["posts"][string];
export type Project = WebState["projects"][string];

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
api.use(function* (ctx, next) {
  const config = yield* select(schema.config.select);
  ctx.request = ctx.req({
    url: `${config.apiUrl}${ctx.req().url}`,
  });
  yield* next();
});
api.use(mdw.fetch());

function mockMdw(data: any, status = 200) {
  return function* (ctx: ApiCtx, next: Next) {
    const config = yield* select(schema.config.select);
    if (config.mockApi === "true") {
      ctx.response = new Response(JSON.stringify(data), { status });
    }

    yield* next();
  };
}

export const selectHasRegistered = createSelector(
  schema.user.select,
  (user) => user.id !== "",
);

export const selectFeatureByName = createSelector(
  schema.features.selectTableAsList,
  (_: WebState, p: { name: string }) => p.name,
  (features, name) => features.find((ff) => ff.name === name),
);

export const selectPostsBySpace = createSelector(
  schema.posts.selectTableAsList,
  (_: WebState, p: { space: string }) => p.space,
  (posts, space) =>
    posts
      .filter((post) => post.space === space)
      .sort((a, b) => {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return bDate.getTime() - aDate.getTime();
      }),
);

export const selectProjectsAsList = createSelector(
  schema.projects.selectTableAsList,
  (projects) =>
    [...projects].sort((a, b) => {
      const aDate = new Date(a.updated_at);
      const bDate = new Date(b.updated_at);
      return bDate.getTime() - aDate.getTime();
    }),
);

export const getPostUrl = (space: string) => (u: User, p: Post) => {
  return `https://${u.name}.${space}.sh/${p.slug}`;
};
export const getProseUrl = getPostUrl("prose");
export const getPastesUrl = getPostUrl("pastes");

export const getProjectUrl = (u: User, p: Project) => {
  if (u.name === p.name) {
    return `https://${u.name}.pgs.sh`;
  }
  return `https://${u.name}-${p.name}.pgs.sh`;
};

export const fetchUser = api.get<never, User>("/current_user", [
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.user.set(ctx.json.value));
  },
  mockMdw({}, 404),
  // mockMdw({ id: "123", name: "erock", fingerprint: "whatever" } as User)
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
      id: "123",
      name: ctx.payload.name,
      fingerprint: "whatever",
    } as User);
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
      ] as Feature[],
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
    pubkeys: [{ id: "1111", key: "xxx", created_at: now }] as Pubkey[],
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
    tokens: [
      { id: "2222", name: "chat", created_at: now, expires_at: year },
    ] as Token[],
  }),
]);

export const fetchProjects = api.get<never, { projects: Project[] }>(
  "/projects",
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    const projects = ctx.json.value.projects.reduce<Record<string, Project>>(
      (acc, pk) => {
        acc[pk.id] = pk;
        return acc;
      },
      {},
    );
    yield* schema.update(schema.projects.set(projects));
  },
);

export const fetchPosts = api.get<{ space: string }, { posts: Post[] }>(
  "/posts/:space",
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    const posts = ctx.json.value.posts.reduce<Record<string, Post>>(
      (acc, pk) => {
        acc[pk.id] = { ...pk, space: ctx.payload.space };
        return acc;
      },
      {},
    );
    yield* schema.update(schema.posts.add(posts));
  },
);
