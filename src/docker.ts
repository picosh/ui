import { createApi, mdw, select } from "starfx";
import { ImageRepo, schema } from "./api.ts";

export const docker = createApi();
docker.use(function* (ctx, next) {
  yield* next();
  console.log("DOCKER", ctx);
});
docker.use(mdw.api({ schema }));
docker.use(docker.routes());
docker.use(function* (ctx, next) {
  ctx.request = ctx.req({
    headers: {
      "Content-Type": "application/json",
    },
  });
  yield* next();
});
docker.use(function* (ctx, next) {
  const config = yield* select(schema.config.select);
  ctx.request = ctx.req({
    url: `${config.dockerUrl}/v2${ctx.req().url}`,
  });
  yield* next();
});
docker.use(mdw.fetch());

export const fetchImageRepos = docker.get<never, { repositories: string[] }>(
  "/_catalog",
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    const repos = ctx.json.value.repositories.reduce<Record<string, ImageRepo>>(
      (acc, repo) => {
        acc[repo] = { id: repo, tags: [] };
        return acc;
      },
      {},
    );
    yield* schema.update(schema.imageRepos.set(repos));
  },
);

export const fetchImageTags = docker.get<
  { name: string },
  { name: string; tags: string[] }
>("/:name/tags/list", function* (ctx, next) {
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  const tags = ctx.json.value.tags;
  yield* schema.update(
    schema.imageRepos.patch({
      [ctx.payload.name]: { id: ctx.payload.name, tags },
    }),
  );
});
