import { createToken, deleteToken, schema, useSelector } from "@app/api";
import { settingsUrl } from "@app/router";
import { BannerLoader, Breadcrumbs, Button, Form } from "@app/shared";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useApi, useDispatch, useLoader, useLoaderSuccess } from "starfx/react";

function DeleteToken({ id }: { id: string }) {
  const navigate = useNavigate();
  const action = deleteToken({ id });
  const del = useApi(action);
  const loader = useLoader(action);
  useLoaderSuccess(loader, () => {
    navigate(settingsUrl());
  });

  return (
    <div className="box group">
      <BannerLoader {...loader} />
      <div>Want to delete this token? It cannot be undone.</div>
      <div>
        <Button onClick={del.trigger} isLoading={loader.isLoading}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export function UpsertTokenPage() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const token = useSelector((s) => schema.tokens.selectById(s, { id }));
  const [name, setName] = useState(token.name);
  useEffect(() => {
    setName(token.name);
  }, [token.name]);

  const create = createToken({ name });
  const createLoader = useLoader(create);
  const onSubmit = () => {
    dispatch(create);
  };
  const isLoading = createLoader.isLoading;
  const text = token.id ? `edit ${token.name}` : "new token";

  return (
    <div className="group">
      <Breadcrumbs
        crumbs={[{ href: settingsUrl(), text: "settings" }]}
        text={text}
      />

      <BannerLoader {...createLoader} />

      {token.id ? (
        <DeleteToken id={id} />
      ) : (
        <Form onSubmit={onSubmit} className="box">
          <label htmlFor="name">Name</label>
          <input
            name="name"
            id="name"
            value={name}
            onChange={(ev) => setName(ev.currentTarget.value)}
          />

          <div>
            <Button type="submit" isLoading={isLoading}>
              Create
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
