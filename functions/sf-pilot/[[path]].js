import { handle } from '../_sf-pilot/router.mjs';
export async function onRequest({ request, env }) { return handle(request, env); }
