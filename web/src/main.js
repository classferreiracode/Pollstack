import { createApp, reactive } from "vue";
import { router } from "./router";
import App from "./App.vue";

const isDev =
  typeof window !== "undefined" &&
  window.location &&
  window.location.port === "5173";
const apiUrl = isDev ? "http://localhost:4000" : "";

const store = reactive({ apiUrl });

const app = createApp(App);
app.provide("store", store);
app.use(router);
app.mount("#app");
