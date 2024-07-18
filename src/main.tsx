import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { type Operation, createStore, parallel, put, takeEvery } from "starfx";
import { Provider } from "starfx/react";
import { api, bootup, initialState, schema, thunks } from "./api.ts";
import { router } from "./router.tsx";

init();

function init() {
  const el = document.getElementById("root");
  if (!el) {
    throw new Error("root element not found");
  }
  const store = createStore({ initialState });
  (window as any).store = store;
  store.run(function* (): Operation<void> {
    const group = yield* parallel([
      takeEvery("*", function* (action) {
        if (action.type === "store") return;
        console.log("ACTION", action);
      }),
      api.bootup,
      thunks.bootup,
    ]);
    yield* put(bootup());
    yield* group;
  });

  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <Provider schema={schema} store={store}>
        <RouterProvider router={router} />
      </Provider>
    </React.StrictMode>,
  );
}
