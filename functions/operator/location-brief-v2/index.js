import { operatorAllowed, privateHtml } from "../../api/location-brief-v2/_shared.js";

function page() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Rofo Location Brief v2 Operator Entry</title><link rel="stylesheet" href="/assets/requirement-prototype.css"></head><body>
  <main class="requirement-prototype"><header class="requirement-prototype__header"><div><p class="requirement-prototype__eyebrow">Operator-only · Feature flagged · No leads</p><h1>Start a new search.</h1><p>Complete the adaptive Location Requirement interview, then Rofo will create a persistent Brief automatically. No lead or contact is created.</p><p><a class="requirement-button requirement-button--primary" href="/prototype/requirement-v1/?locationBriefV2=new">Start a new search</a></p></div></header></main></body></html>`;
}

export async function onRequestGet({ request, env }) {
  if (!operatorAllowed(request, env)) return privateHtml("Operator Location Brief v2 is disabled.", 404);
  return privateHtml(page());
}
