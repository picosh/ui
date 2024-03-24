import {
  createPubkey,
  deletePubkey,
  schema,
  updatePubkey,
  useSelector,
} from "@app/api";
import { settingsUrl } from "@app/router";
import { BannerLoader, Breadcrumbs, Button, Form } from "@app/shared";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useApi, useDispatch, useLoader, useLoaderSuccess } from "starfx/react";

function DeletePubkey({ id }: { id: string }) {
  const navigate = useNavigate();
  const action = deletePubkey({ id });
  const del = useApi(action);
  const loader = useLoader(action);
  const [confirm, setConfirm] = useState(false);
  useLoaderSuccess(loader, () => {
    navigate(settingsUrl());
  });

  return (
    <div className="box group">
      <BannerLoader {...loader} />
      <div>Want to delete this pubkey? It cannot be undone.</div>
      <div>
        {confirm ? (
          <div className="group">
            <div>Are you sure?</div>
            <div className="group-h">
              <Button onClick={del.trigger}>Delete</Button>
              <Button onClick={() => setConfirm(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setConfirm(true)} isLoading={loader.isLoading}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

export function UpsertPubkeyPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pubkey = useSelector((s) => schema.pubkeys.selectById(s, { id }));
  const [name, setName] = useState(pubkey.name);
  useEffect(() => {
    setName(pubkey.name);
  }, [pubkey.name]);

  const [pk, setPk] = useState(pubkey.key);
  useEffect(() => {
    setPk(pubkey.key);
  }, [pubkey.key]);

  const create = createPubkey({ name, pubkey: pk });
  const createLoader = useLoader(create);
  const update = updatePubkey({ id: pubkey.id, name });
  const updateLoader = useLoader(update);
  const onSubmit = () => {
    if (pubkey.id) {
      dispatch(update);
    } else {
      dispatch(create);
    }
  };
  useLoaderSuccess(createLoader, () => {
    navigate(settingsUrl());
  });
  useLoaderSuccess(updateLoader, () => {
    navigate(settingsUrl());
  });

  const text = pubkey.id ? `edit ${pubkey.name}` : "new pubkey";
  const isLoading = createLoader.isLoading || updateLoader.isLoading;

  return (
    <div className="group">
      <Breadcrumbs
        crumbs={[{ href: settingsUrl(), text: "settings" }]}
        text={text}
      />

      <Form onSubmit={onSubmit} className="box">
        <BannerLoader {...createLoader} />
        <BannerLoader {...updateLoader} />

        <label htmlFor="name">Name</label>
        <input
          name="name"
          id="name"
          value={name}
          onChange={(ev) => setName(ev.currentTarget.value)}
        />

        <label htmlFor="pubkey">Pubkey</label>
        <input
          name="pubkey"
          id="pubkey"
          value={pk}
          onChange={(ev) => setPk(ev.currentTarget.value)}
          disabled={!!pubkey.id}
        />

        <div>
          <Button type="submit" isLoading={isLoading}>
            {pubkey.id ? "Update" : "Create"}
          </Button>
        </div>
      </Form>

      {pubkey.id ? <DeletePubkey id={id} /> : null}
    </div>
  );
}
