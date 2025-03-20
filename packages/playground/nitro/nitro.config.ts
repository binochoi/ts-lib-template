import rpc from 'nitro-rpc-definition'
//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  modules: [rpc()],
  compatibilityDate: "2025-03-18",
});