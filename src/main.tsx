import React from "react";
import ReactDOM from "react-dom/client";
import { Operation, parallel, put } from "starfx";
import { Provider } from "starfx/react";
import { configureStore } from "starfx/store";
import { api, bootup, initialState, schema, thunks } from "./api.ts";
import { App } from "./app.tsx";

init();

function init() {
  const el = document.getElementById("root");
  if (!el) {
    throw new Error("root element not found");
  }
  const store = configureStore({ initialState });
  (window as any).store = store;
  store.run(function* (): Operation<void> {
    const group = yield* parallel([api.bootup, thunks.bootup]);
    yield* put(bootup());
    yield* group;
  });

  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <Provider schema={schema} store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  );
}
