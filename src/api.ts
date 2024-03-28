import {
  ApiCtx,
  Next,
  createAction,
  createApi,
  createSchema,
  createSelector,
  createThunks,
  mdw,
  poll,
  put,
  select,
  slice,
} from "starfx";
import { TypedUseSelectorHook, useSelector as useSel } from "starfx/react";

interface AclData {
  data: null | string[];
  type: string;
}

export interface VisitInterval {
  post_id: string;
  project_id: string;
  interval: string;
  visitors: number;
}

export interface VisitUrl {
  post_id: string;
  project_id: string;
  url: string;
  count: number;
}

export interface SummaryAnalytics {
  intervals: VisitInterval[];
  top_urls: VisitUrl[];
  top_referers: VisitUrl[];
}

export type PostSpace = "prose" | "pastes" | "feeds" | "unknown";

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
    dockerUrl:
      import.meta.env.VITE_DOCKER_API_URL ||
      `${location.protocol}//${location.hostname}:1338`,
  }),
  user: slice.obj({
    id: "",
    name: unknown,
    fingerprint: "SHA256:GpgLu/REpFbhrJrqzLDfnms5fKfCODbHo17Q1ZO/lLo",
    created_at: now,
  }),
  rssToken: slice.str(),
  tokens: slice.table({
    empty: { id: "", name: "", created_at: now, expires_at: year },
  }),
  pubkeys: slice.table({
    empty: { id: "", name: "", key: "", created_at: now },
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
      space: "unknown" as PostSpace,
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
      acl: { data: [], type: "" } as AclData,
    },
  }),
  objects: slice.table({
    empty: {
      id: "",
      name: "",
      size: 0,
      mod_time: now,
    },
  }),
  imageRepos: slice.table({
    empty: {
      id: "",
      tags: [] as string[],
    },
  }),
  analyticsYearly: slice.obj<SummaryAnalytics>({
    intervals: [],
    top_urls: [],
    top_referers: [],
  }),
  analyticsMonthly: slice.obj<SummaryAnalytics>({
    intervals: [],
    top_urls: [],
    top_referers: [],
  }),
});
export type WebState = typeof initialState;
export type User = WebState["user"];
export type Token = WebState["tokens"][string];
export type Pubkey = WebState["pubkeys"][string];
export type FeatureFlag = WebState["features"][string];
export type Post = WebState["posts"][string];
export type Project = WebState["projects"][string];
export type ProjectObject = WebState["objects"][string];
export type ImageRepo = WebState["imageRepos"][string];

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
  yield* fetchUser.run();
  const hasRegistered = yield* select(selectHasRegistered);
  if (hasRegistered) {
    yield* put([
      fetchFeatures(),
      fetchPosts({ space: "prose" }),
      fetchPosts({ space: "feeds" }),
      fetchPosts({ space: "pastes" }),
      fetchPubkeys(),
      fetchProjects(),
      fetchTokens(),
      fetchSummaryAnalytics(),
    ]);
  }
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
  (user) => {
    return user.id !== "";
  },
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

export const selectProjectUrl = createSelector(
  schema.user.select,
  schema.projects.selectById,
  (user, project) => {
    return getProjectUrl(user, project);
  },
);

export const objectSort = (a: ProjectObject, b: ProjectObject) => {
  const aDir = a.name.includes("/");
  const bDir = b.name.includes("/");
  if (aDir && bDir) {
    return a.name.localeCompare(b.name);
  }
  if (!aDir && !bDir) {
    return a.name.localeCompare(b.name);
  }
  if (aDir) return 1;
  return -1;
};

export const selectObjectsByProjectName = createSelector(
  schema.objects.selectTableAsList,
  (_: WebState, p: { name: string }) => p.name,
  (objects, projectName) => {
    return objects
      .filter((obj) => obj.id.startsWith(projectName))
      .sort(objectSort);
  },
);

export const selectStats = createSelector(
  schema.projects.selectTableAsList,
  schema.posts.selectTableAsList,
  (projects, posts) => {
    const map: Record<PostSpace, number> = {
      prose: 0,
      pastes: 0,
      feeds: 0,
      unknown: 0,
    };
    for (const post of posts) {
      map[post.space] += 1;
    }

    return {
      projects: projects.length,
      prose: map.prose,
      pastes: map.pastes,
      feeds: map.feeds,
    };
  },
);

export const selectPubkeysAsList = createSelector(
  schema.user.select,
  schema.pubkeys.selectTableAsList,
  (user, pubkeys) =>
    [...pubkeys].sort((a, b) => {
      // current should always be at top
      if (a.key === user.fingerprint) {
        return -1;
      }
      if (b.key === user.fingerprint) {
        return 1;
      }
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return bDate - aDate;
    }),
);

export const selectProjectByName = createSelector(
  schema.projects.selectTableAsList,
  (_: WebState, p: { name: string }) => p.name,
  (projects, name) =>
    projects.find((p) => p.name === name) || schema.projects.empty,
);

export const selectYearlyIntervals = createSelector(
  schema.analyticsYearly.select,
  (summary) => {
    return [...summary.intervals].sort((a, b) => b.visitors - a.visitors);
  },
);

export const selectMonthlyAnalyticsByProject = createSelector(
  schema.analyticsMonthly.select,
  (analytics) => {
    const intervals = [...analytics.intervals];
    const top_urls = [...analytics.top_urls].sort((a, b) => b.count - a.count);
    const top_referers = [...analytics.top_referers].sort(
      (a, b) => b.count - a.count,
    );
    return {
      intervals,
      top_urls,
      top_referers,
    };
  },
);

export const selectMonthlyAnalyticsByBlog = createSelector(
  schema.analyticsMonthly.select,
  (analytics) => {
    const intervals = analytics.intervals.filter(
      (interval) => interval.post_id !== "" || interval.project_id === "",
    );
    const top_urls = analytics.top_urls.filter(
      (interval) => interval.post_id !== "" || interval.project_id === "",
    );
    const top_referers = analytics.top_referers.filter(
      (interval) => interval.post_id !== "" || interval.project_id === "",
    );
    return {
      intervals,
      top_urls,
      top_referers,
    };
  },
);

export const getPostUrl = (space: string) => (u: User, p: Post) => {
  return `https://${u.name}.${space}.sh/${p.slug}`;
};
export const getProseUrl = getPostUrl("prose");
export const getPastesUrl = getPostUrl("pastes");

export const getProjectUrl = (
  u: Pick<User, "name">,
  p: Pick<Project, "name">,
) => {
  if (u.name === p.name) {
    return `https://${u.name}.pgs.sh`;
  }
  return `https://${u.name}-${p.name}.pgs.sh`;
};

const deserializeUser = (data: UserResp): User => {
  return {
    id: data.id || "",
    created_at: data.created_at || now,
    name: data.name || unknown,
    fingerprint: data.fingerprint,
  };
};

interface UserResp {
  id?: string;
  name?: string;
  created_at?: string;
  fingerprint: string;
}

export const fetchUser = api.get<never, UserResp>("/current_user", [
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    const data = ctx.json.value;
    yield* schema.update(schema.user.set(deserializeUser(data)));
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

function* saveFeatures(features: FeatureFlag[]) {
  const ff = features.reduce<Record<string, FeatureFlag>>((acc, ff) => {
    acc[ff.id] = ff;
    return acc;
  }, {});
  yield* schema.update(schema.features.add(ff));
}

export const fetchFeatures = api.get<never, { features: FeatureFlag[] }>(
  "/features",
  [
    function* (ctx, next) {
      yield* next();
      if (!ctx.json.ok) {
        return;
      }

      yield* saveFeatures(ctx.json.value.features);
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

export const cancelPollFeatures = createAction("cancel-features-poller");
export const pollFeatures = api.get<never, { features: FeatureFlag[] }>(
  ["/features", "poller"],
  { supervisor: poll(5 * 1000, cancelPollFeatures.toString()) },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    yield* saveFeatures(ctx.json.value.features);
  },
);

export const fetchOrCreateToken = api.put<never, { secret: string }>(
  "/rss-token",
  [
    function* (ctx, next) {
      yield* next();
      if (!ctx.json.ok) {
        return;
      }

      const value = ctx.json.value;
      yield* schema.update(schema.rssToken.set(value.secret));
    },
    mockMdw({
      token: "asbcasasd",
    }),
  ],
);

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
        acc[pk.id] = { ...pk, space: ctx.payload.space as PostSpace };
        return acc;
      },
      {},
    );
    yield* schema.update(schema.posts.add(posts));
  },
);

export const fetchProjectObjects = api.get<
  { name: string },
  { objects: ProjectObject[] }
>("/projects/:name", function* (ctx, next) {
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  const objects = ctx.json.value.objects.reduce<Record<string, ProjectObject>>(
    (acc, pk) => {
      acc[pk.id] = pk;
      return acc;
    },
    {},
  );
  yield* schema.update(schema.objects.add(objects));
});

export const updateDockerConfig = thunks.create<{ url: string }>(
  "update-docker-config",
  function* (ctx, next) {
    yield* schema.update(
      schema.config.update({ key: "dockerUrl", value: ctx.payload.url }),
    );
    yield* next();
  },
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

export const createPubkey = api.post<{ name: string; pubkey: string }, Pubkey>(
  "/pubkeys",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify(ctx.payload),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const pubkey = ctx.json.value;
    yield* schema.update(schema.pubkeys.add({ [pubkey.id]: pubkey }));
  },
);

export const updatePubkey = api.patch<{ name: string; id: string }, Pubkey>(
  "/pubkeys/:id",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify(ctx.payload),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const pubkey = ctx.json.value;
    yield* schema.update(schema.pubkeys.add({ [pubkey.id]: pubkey }));
  },
);

export const deletePubkey = api.delete<{ id: string }>(
  "/pubkeys/:id",
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.pubkeys.remove([ctx.payload.id]));
  },
);

export const createToken = api.post<
  { name: string },
  { secret: string; token: Token }
>("/tokens", function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify(ctx.payload),
  });

  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const { secret, token } = ctx.json.value;
  yield* schema.update(schema.tokens.add({ [token.id]: token }));
  ctx.loader = {
    message: `Token created!  Save this secret, you won't see it again: ${secret}`,
  };
});

export const deleteToken = api.delete<{ id: string }>(
  "/tokens/:id",
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.tokens.remove([ctx.payload.id]));
  },
);

export const fetchSummaryAnalytics = api.get<never, SummaryAnalytics>(
  "/analytics/year",
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.analyticsYearly.set(ctx.json.value));
  },
);

export const fetchMonthlyAnalyticsByProject = api.get<
  { projectId: string },
  SummaryAnalytics
>("/projects/:projectId/analytics", function* (ctx, next) {
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  yield* schema.update(schema.analyticsMonthly.set(ctx.json.value));
});
