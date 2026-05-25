#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const WORKSPACE_DATA = "data/media/generated/district_media_review_workspace_v1/workspace-data.js";
const DEFAULT_REVIEW_STATE = "data/media/generated/district_media_review_workspace_v1/district-media-review-state-v1.json";
const OUTPUT_ROOT = "assets/images/districts";
const MANIFEST_PATH = "data/media/generated/curated_district_media_export_v1.json";
const REPORT_PATH = "data/media/reports/curated_district_media_export_v1.md";

const ACCEPTED_STATES = new Set(["accepted", "hero_candidate", "supporting_candidate"]);
const DEFAULTS = {
  maxWidth: 1600,
  quality: 78,
  thumbnailWidth: 480,
  thumbnailQuality: 72,
  thumbnails: false,
};

function parseArgs(argv) {
  const args = {
    reviewState: process.env.REVIEW_STATE_JSON || DEFAULT_REVIEW_STATE,
    workspaceData: process.env.WORKSPACE_DATA || WORKSPACE_DATA,
    outputRoot: process.env.OUTPUT_ROOT || OUTPUT_ROOT,
    manifestPath: process.env.MANIFEST_PATH || MANIFEST_PATH,
    maxWidth: Number(process.env.MAX_WIDTH || DEFAULTS.maxWidth),
    quality: Number(process.env.WEBP_QUALITY || DEFAULTS.quality),
    thumbnails: process.env.THUMBNAILS === "1" || DEFAULTS.thumbnails,
    thumbnailWidth: Number(process.env.THUMBNAIL_WIDTH || DEFAULTS.thumbnailWidth),
    thumbnailQuality: Number(process.env.THUMBNAIL_QUALITY || DEFAULTS.thumbnailQuality),
    dryRun: process.env.DRY_RUN === "1",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--review-state") args.reviewState = next, index += 1;
    else if (arg === "--workspace-data") args.workspaceData = next, index += 1;
    else if (arg === "--output-root") args.outputRoot = next, index += 1;
    else if (arg === "--manifest") args.manifestPath = next, index += 1;
    else if (arg === "--max-width") args.maxWidth = Number(next), index += 1;
    else if (arg === "--quality") args.quality = Number(next), index += 1;
    else if (arg === "--thumbnails") args.thumbnails = true;
    else if (arg === "--thumbnail-width") args.thumbnailWidth = Number(next), index += 1;
    else if (arg === "--thumbnail-quality") args.thumbnailQuality = Number(next), index += 1;
    else if (arg === "--dry-run") args.dryRun = true;
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readWorkspaceData(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const prefix = "window.DISTRICT_MEDIA_REVIEW_WORKSPACE_V1 = ";
  if (!source.startsWith(prefix)) {
    throw new Error(`Unexpected workspace data format: ${filePath}`);
  }
  return JSON.parse(source.slice(prefix.length).replace(/;\s*$/, ""));
}

function readReviewState(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      generated_at: new Date().toISOString(),
      state: {},
      missing_input: true,
      missing_input_path: filePath,
    };
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (parsed && parsed.state && typeof parsed.state === "object") return parsed;
  if (parsed && typeof parsed === "object") return { generated_at: null, state: parsed };
  return { generated_at: null, state: {} };
}

function keyFor(candidate, image) {
  return [candidate.district_slug, candidate.building_id, image && image.filename ? image.filename : "no-image"].join("::");
}

function candidateImages(candidate) {
  return candidate.image_candidate_summaries && candidate.image_candidate_summaries.length
    ? candidate.image_candidate_summaries
    : [];
}

function findSourcePath(image, workspaceDir) {
  const candidates = [
    image.local_relative_path ? path.join(workspaceDir, image.local_relative_path) : null,
    image.local_relative_path,
    image.absolute_path,
    image.original_absolute_path,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function hashPart(image, sourcePath) {
  const filename = image.filename || path.basename(sourcePath || "");
  const match = filename.match(/^[0-9]+_([^.]+)/);
  if (match) return match[1].slice(0, 12);
  return crypto.createHash("sha1").update(filename).digest("hex").slice(0, 12);
}

function deterministicFilename(districtSlug, candidate, image, state, sourcePath, suffix = "") {
  const role = state === "hero_candidate" ? "hero" : state === "supporting_candidate" ? "supporting" : "accepted";
  const hash = hashPart(image, sourcePath);
  return `${districtSlug}-${role}-${candidate.building_id}-${hash}${suffix}.webp`;
}

function commandExists(command) {
  return spawnSync("sh", ["-lc", `command -v ${command}`], { stdio: "ignore" }).status === 0;
}

function detectEncoder() {
  try {
    require.resolve("sharp");
    return { type: "sharp", available: true };
  } catch (_) {
    // Fall through to command-line encoders.
  }
  if (commandExists("cwebp")) return { type: "cwebp", available: true };
  if (commandExists("magick")) return { type: "magick", available: true };
  if (commandExists("convert")) return { type: "convert", available: true };
  return {
    type: "none",
    available: false,
    message: "No WebP encoder found. Install sharp, cwebp, or ImageMagick to generate optimized .webp assets.",
  };
}

function imageDimensions(sourcePath) {
  if (!commandExists("sips")) return null;
  const result = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", sourcePath], { encoding: "utf8" });
  if (result.status !== 0) return null;
  const width = result.stdout.match(/pixelWidth:\s+([0-9]+)/);
  const height = result.stdout.match(/pixelHeight:\s+([0-9]+)/);
  if (!width || !height) return null;
  return { width: Number(width[1]), height: Number(height[1]) };
}

async function encodeWithSharp(sourcePath, targetPath, maxWidth, quality) {
  const sharp = require("sharp");
  await sharp(sourcePath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(targetPath);
}

function runCommand(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout || "unknown error"}`);
  }
}

function encodeWithCommand(encoder, sourcePath, targetPath, maxWidth, quality) {
  if (encoder.type === "magick") {
    runCommand("magick", [sourcePath, "-auto-orient", "-resize", `${maxWidth}x${maxWidth}>`, "-quality", String(quality), targetPath]);
    return;
  }
  if (encoder.type === "convert") {
    runCommand("convert", [sourcePath, "-auto-orient", "-resize", `${maxWidth}x${maxWidth}>`, "-quality", String(quality), targetPath]);
    return;
  }
  if (encoder.type === "cwebp") {
    const dims = imageDimensions(sourcePath);
    const args = ["-quiet", "-q", String(quality)];
    if (dims && dims.width > maxWidth) {
      const height = Math.max(1, Math.round((dims.height * maxWidth) / dims.width));
      args.push("-resize", String(maxWidth), String(height));
    }
    args.push(sourcePath, "-o", targetPath);
    runCommand("cwebp", args);
  }
}

async function encodeImage(encoder, sourcePath, targetPath, maxWidth, quality, dryRun) {
  if (dryRun) return;
  ensureDir(path.dirname(targetPath));
  if (encoder.type === "sharp") await encodeWithSharp(sourcePath, targetPath, maxWidth, quality);
  else encodeWithCommand(encoder, sourcePath, targetPath, maxWidth, quality);
}

function collectCuratedItems(workspaceData, reviewState) {
  const items = [];
  for (const district of workspaceData.districts || []) {
    for (const tier of ["priority_review", "secondary_review"]) {
      for (const candidate of district[tier] || []) {
        const candidateWithDistrict = { ...candidate, district_slug: district.district_slug };
        for (const image of candidateImages(candidate)) {
          const state = reviewState.state[keyFor(candidateWithDistrict, image)];
          if (!ACCEPTED_STATES.has(state)) continue;
          items.push({
            district,
            candidate: candidateWithDistrict,
            image,
            review_state: state,
            review_tier: tier,
          });
        }
      }
    }
  }
  return items;
}

function writeReport(manifest) {
  const rows = Object.entries(manifest.districts)
    .map(([slug, district]) => `| ${slug} | ${district.exported_count} | ${district.skipped_count} |`)
    .join("\n");
  const report = `# Curated District Media Export V1

Generated curated editorial district media export infrastructure.

## Scope

- Review-state input: \`${manifest.input_files.review_state}\`
- Workspace data input: \`${manifest.input_files.workspace_data}\`
- Output root: \`${manifest.output_root}\`
- Encoder: ${manifest.encoder.type}
- Curated review states: accepted, hero_candidate, supporting_candidate

## Result

- Curated items found: ${manifest.totals.curated_items}
- Assets exported: ${manifest.totals.exported}
- Assets skipped: ${manifest.totals.skipped}

| District | Exported | Skipped |
|---|---:|---:|
${rows || "| none | 0 | 0 |"}

## Guardrails

- Originals are preserved untouched.
- Only reviewed accepted/hero/supporting images are eligible.
- The script does not process the full archive.
- No public templates, routes, galleries, or uploads are created.

${manifest.warnings.length ? `## Warnings\n\n${manifest.warnings.map((warning) => `- ${warning}`).join("\n")}\n` : ""}
`;
  ensureDir(path.dirname(REPORT_PATH));
  fs.writeFileSync(REPORT_PATH, report);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  ensureDir(path.dirname(args.manifestPath));
  ensureDir(args.outputRoot);

  const workspaceData = readWorkspaceData(args.workspaceData);
  const workspaceDir = path.dirname(args.workspaceData);
  const reviewState = readReviewState(args.reviewState);
  const encoder = detectEncoder();
  const curatedItems = collectCuratedItems(workspaceData, reviewState);
  const manifest = {
    version: "v1",
    generated_at: new Date().toISOString(),
    public_ready: false,
    purpose: "Curated editorial district media export for reviewed accepted images.",
    guardrails: [
      "Preserve originals untouched.",
      "Export only accepted, hero_candidate, and supporting_candidate review states.",
      "Do not process the full archive.",
      "Do not create galleries, public routes, uploads, or template integrations.",
    ],
    input_files: {
      review_state: args.reviewState,
      workspace_data: args.workspaceData,
    },
    output_root: args.outputRoot,
    defaults: {
      max_width: args.maxWidth,
      webp_quality: args.quality,
      thumbnails: args.thumbnails,
      thumbnail_width: args.thumbnailWidth,
      thumbnail_quality: args.thumbnailQuality,
    },
    encoder,
    review_states_exported: Array.from(ACCEPTED_STATES),
    totals: {
      curated_items: curatedItems.length,
      exported: 0,
      skipped: 0,
    },
    districts: {},
    assets: [],
    skipped: [],
    warnings: [],
  };

  if (reviewState.missing_input) {
    manifest.warnings.push(`Review-state JSON not found: ${reviewState.missing_input_path}. No assets were eligible for export.`);
  }
  if (!encoder.available && curatedItems.length) {
    manifest.warnings.push(encoder.message);
  }

  for (const item of curatedItems) {
    const { district, candidate, image, review_state: reviewStateValue, review_tier: reviewTier } = item;
    const districtSlug = district.district_slug;
    if (!manifest.districts[districtSlug]) {
      manifest.districts[districtSlug] = {
        district_name: district.district_name,
        exported_count: 0,
        skipped_count: 0,
        assets: [],
      };
    }

    const sourcePath = findSourcePath(image, workspaceDir);
    const filename = deterministicFilename(districtSlug, candidate, image, reviewStateValue, sourcePath);
    const outputPath = path.join(args.outputRoot, districtSlug, filename);
    const thumbnailFilename = deterministicFilename(districtSlug, candidate, image, reviewStateValue, sourcePath, "-thumb");
    const thumbnailPath = path.join(args.outputRoot, districtSlug, thumbnailFilename);
    const record = {
      district_slug: districtSlug,
      district_name: district.district_name,
      building_id: candidate.building_id,
      building_name: candidate.building_name,
      address: candidate.address,
      review_state: reviewStateValue,
      review_tier: reviewTier,
      source_filename: image.filename,
      source_absolute_path: image.original_absolute_path || image.absolute_path || null,
      source_local_path: image.local_relative_path || null,
      resolved_source_path: sourcePath,
      output_path: outputPath,
      output_url_path: `/${outputPath}`,
      thumbnail_path: args.thumbnails ? thumbnailPath : null,
      thumbnail_url_path: args.thumbnails ? `/${thumbnailPath}` : null,
      max_width: args.maxWidth,
      webp_quality: args.quality,
      exported: false,
      skip_reason: null,
    };

    if (!sourcePath) {
      record.skip_reason = "source_image_not_available_locally";
    } else if (!encoder.available) {
      record.skip_reason = "webp_encoder_not_available";
    }

    if (record.skip_reason) {
      manifest.totals.skipped += 1;
      manifest.districts[districtSlug].skipped_count += 1;
      manifest.skipped.push(record);
      continue;
    }

    await encodeImage(encoder, sourcePath, outputPath, args.maxWidth, args.quality, args.dryRun);
    if (args.thumbnails) {
      await encodeImage(encoder, sourcePath, thumbnailPath, args.thumbnailWidth, args.thumbnailQuality, args.dryRun);
    }
    record.exported = !args.dryRun;
    record.dry_run = args.dryRun;
    if (!args.dryRun) {
      const stats = fs.statSync(outputPath);
      record.output_size_bytes = stats.size;
    }
    manifest.totals.exported += 1;
    manifest.districts[districtSlug].exported_count += 1;
    manifest.districts[districtSlug].assets.push(record);
    manifest.assets.push(record);
  }

  fs.writeFileSync(args.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  writeReport(manifest);
  console.log(`Wrote ${args.manifestPath}`);
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(`Curated items: ${manifest.totals.curated_items}; exported: ${manifest.totals.exported}; skipped: ${manifest.totals.skipped}`);
  if (manifest.warnings.length) {
    for (const warning of manifest.warnings) console.warn(`Warning: ${warning}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
