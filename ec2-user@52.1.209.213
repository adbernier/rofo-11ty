#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_ROOTS = [
  {
    key: "buildings5",
    label: "Building media",
    root: "/ebs2/rofo/content/buildings5",
    knownSize: "620G",
    knownNotes: [
      "Confirmed total volume: 620G",
      "Confirmed orig volume: 342G",
      "Confirmed orig files: 337,050",
      "Confirmed distinct building IDs represented in orig: 175,670",
    ],
  },
  {
    key: "listings4",
    label: "Listing media",
    root: "/ebs2/rofo/content/listings4",
    knownSize: "84G",
    knownNotes: ["Confirmed total volume: 84G"],
  },
  {
    key: "pdfs",
    label: "PDF media",
    root: "/ebs1/rofo/www/content/pdfs",
    knownSize: "2.7G",
    knownNotes: ["Confirmed total volume: 2.7G"],
  },
];

const DERIVATIVE_NAMES = new Set(["orig", "standard", "thumb", "smthumb"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tif", ".tiff"]);
const DEFAULT_REPORT_DIR = "data/media/reports";
const DEFAULT_SAMPLE_DIR = "data/media/generated";
const DEFAULT_MAX_DIMENSION_SAMPLES = 2500;
const DEFAULT_MAX_EXACT_DUP_SAMPLES = 25000;
const DEFAULT_SAMPLE_MANIFEST_LIMIT = 250;

function parseArgs(argv) {
  const args = {
    reportDir: DEFAULT_REPORT_DIR,
    sampleDir: DEFAULT_SAMPLE_DIR,
    maxDimensionSamples: DEFAULT_MAX_DIMENSION_SAMPLES,
    maxExactDuplicateSamples: DEFAULT_MAX_EXACT_DUP_SAMPLES,
    sampleManifestLimit: DEFAULT_SAMPLE_MANIFEST_LIMIT,
    roots: DEFAULT_ROOTS,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--report-dir" && next) {
      args.reportDir = next;
      i += 1;
    } else if (arg === "--sample-dir" && next) {
      args.sampleDir = next;
      i += 1;
    } else if (arg === "--max-dimension-samples" && next) {
      args.maxDimensionSamples = Number(next);
      i += 1;
    } else if (arg === "--max-exact-duplicate-samples" && next) {
      args.maxExactDuplicateSamples = Number(next);
      i += 1;
    } else if (arg === "--sample-manifest-limit" && next) {
      args.sampleManifestLimit = Number(next);
      i += 1;
    } else if (arg === "--root" && next) {
      const [key, root] = next.split("=");
      if (!key || !root) {
        throw new Error("--root must use key=/absolute/path format");
      }
      args.roots = args.roots.map((entry) => (entry.key === key ? { ...entry, root } : entry));
      i += 1;
    }
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function pushLimited(list, item, limit) {
  if (list.length < limit) list.push(item);
}

function parseMediaName(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, ext);
  const match = baseName.match(/^(\d+)_([A-Za-z0-9_-]+)$/);
  if (!match) {
    return { ext, baseName, buildingId: null, hash: null, matchesBuildingHashPattern: false };
  }
  return {
    ext,
    baseName,
    buildingId: match[1],
    hash: match[2],
    matchesBuildingHashPattern: true,
  };
}

function derivativeFromPath(filePath, root) {
  const rel = path.relative(root, filePath);
  const first = rel.split(path.sep)[0];
  return DERIVATIVE_NAMES.has(first) ? first : "unclassified";
}

function getJpegSize(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
}

function getPngSize(buffer) {
  if (buffer.length < 24) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function getGifSize(buffer) {
  if (buffer.length < 10) return null;
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

function getWebpSize(buffer) {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 " && buffer.length >= 30) {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X" && buffer.length >= 30) {
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1,
    };
  }
  return null;
}

function readImageDimensions(filePath, ext) {
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(512 * 1024);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    const slice = buffer.subarray(0, bytesRead);
    if (ext === ".jpg" || ext === ".jpeg") return getJpegSize(slice);
    if (ext === ".png") return getPngSize(slice);
    if (ext === ".gif") return getGifSize(slice);
    if (ext === ".webp") return getWebpSize(slice);
    return null;
  } catch {
    return null;
  } finally {
    fs.closeSync(fd);
  }
}

function hashFilePrefix(filePath) {
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(1024 * 1024);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    return crypto.createHash("sha1").update(buffer.subarray(0, bytesRead)).digest("hex");
  } catch {
    return null;
  } finally {
    fs.closeSync(fd);
  }
}

function createEmptyRootSummary(rootConfig) {
  return {
    ...rootConfig,
    accessible: false,
    fileCount: 0,
    dirCount: 0,
    totalBytes: 0,
    extCounts: new Map(),
    extBytes: new Map(),
    derivativeCounts: new Map(),
    derivativeBytes: new Map(),
    buildingIds: new Map(),
    buildingOriginalCounts: new Map(),
    hashDerivativeMap: new Map(),
    duplicatePrefixHashes: new Map(),
    oldest: null,
    newest: null,
    largestFiles: [],
    sampleFiles: [],
    dimensionSamples: [],
    patternMatches: 0,
    patternMisses: 0,
    imageFiles: 0,
    nonImageFiles: 0,
    errors: [],
  };
}

function updateTime(summary, filePath, stats) {
  const mtime = stats.mtime.toISOString();
  if (!summary.oldest || mtime < summary.oldest.mtime) {
    summary.oldest = { filePath, mtime };
  }
  if (!summary.newest || mtime > summary.newest.mtime) {
    summary.newest = { filePath, mtime };
  }
}

function updateLargest(summary, record) {
  summary.largestFiles.push(record);
  summary.largestFiles.sort((a, b) => b.bytes - a.bytes);
  if (summary.largestFiles.length > 25) summary.largestFiles.length = 25;
}

async function walkDir(startDir, onFile, onDirError) {
  const stack = [startDir];
  while (stack.length) {
    const current = stack.pop();
    let dir;
    try {
      dir = await fs.promises.opendir(current);
    } catch (error) {
      onDirError(current, error);
      continue;
    }
    for await (const dirent of dir) {
      const fullPath = path.join(current, dirent.name);
      if (dirent.isDirectory()) {
        stack.push(fullPath);
      } else if (dirent.isFile()) {
        await onFile(fullPath, dirent.name);
      }
    }
  }
}

async function analyzeRoot(rootConfig, options) {
  const summary = createEmptyRootSummary(rootConfig);
  if (!fs.existsSync(rootConfig.root)) {
    summary.errors.push(`Path not found: ${rootConfig.root}`);
    return summary;
  }
  summary.accessible = true;

  await walkDir(
    rootConfig.root,
    async (filePath, fileName) => {
      let stats;
      try {
        stats = await fs.promises.stat(filePath);
      } catch (error) {
        summary.errors.push(`Could not stat ${filePath}: ${error.message}`);
        return;
      }

      const parsed = parseMediaName(fileName);
      const derivative = derivativeFromPath(filePath, rootConfig.root);
      const rel = path.relative(rootConfig.root, filePath);

      summary.fileCount += 1;
      summary.totalBytes += stats.size;
      increment(summary.extCounts, parsed.ext || "[none]");
      increment(summary.extBytes, parsed.ext || "[none]", stats.size);
      increment(summary.derivativeCounts, derivative);
      increment(summary.derivativeBytes, derivative, stats.size);
      updateTime(summary, rel, stats);
      updateLargest(summary, { filePath: rel, bytes: stats.size, ext: parsed.ext || "[none]", derivative });
      pushLimited(summary.sampleFiles, { filePath: rel, bytes: stats.size, ext: parsed.ext || "[none]", derivative }, options.sampleManifestLimit);

      if (IMAGE_EXTENSIONS.has(parsed.ext)) summary.imageFiles += 1;
      else summary.nonImageFiles += 1;

      if (parsed.matchesBuildingHashPattern) {
        summary.patternMatches += 1;
        increment(summary.buildingIds, parsed.buildingId);
        if (derivative === "orig") increment(summary.buildingOriginalCounts, parsed.buildingId);
        const hashKey = `${parsed.buildingId}_${parsed.hash}`;
        const derivativeSet = summary.hashDerivativeMap.get(hashKey) || new Set();
        derivativeSet.add(derivative);
        summary.hashDerivativeMap.set(hashKey, derivativeSet);
      } else {
        summary.patternMisses += 1;
      }

      if (summary.dimensionSamples.length < options.maxDimensionSamples && IMAGE_EXTENSIONS.has(parsed.ext)) {
        const dimensions = readImageDimensions(filePath, parsed.ext);
        if (dimensions) {
          summary.dimensionSamples.push({
            filePath: rel,
            ext: parsed.ext,
            derivative,
            bytes: stats.size,
            width: dimensions.width,
            height: dimensions.height,
          });
        }
      }

      if (summary.fileCount <= options.maxExactDuplicateSamples && stats.size > 0) {
        const prefixHash = hashFilePrefix(filePath);
        if (prefixHash) increment(summary.duplicatePrefixHashes, `${stats.size}:${prefixHash}`);
      }
    },
    (dirPath, error) => {
      summary.errors.push(`Could not open ${dirPath}: ${error.message}`);
    },
  );

  return summary;
}

function topMapEntries(map, limit = 20) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function derivativeRelationshipSummary(summary) {
  let allDerivatives = 0;
  let origOnly = 0;
  let noOrig = 0;
  let multiDerivative = 0;
  for (const derivatives of summary.hashDerivativeMap.values()) {
    const hasOrig = derivatives.has("orig");
    if (derivatives.size >= 4 && hasOrig && derivatives.has("standard") && derivatives.has("thumb") && derivatives.has("smthumb")) {
      allDerivatives += 1;
    } else if (derivatives.size === 1 && hasOrig) {
      origOnly += 1;
    } else if (!hasOrig) {
      noOrig += 1;
    }
    if (derivatives.size > 1) multiDerivative += 1;
  }
  return { allDerivatives, origOnly, noOrig, multiDerivative, uniqueMediaHashes: summary.hashDerivativeMap.size };
}

function dimensionBucket(sample) {
  const edge = Math.max(sample.width, sample.height);
  if (edge < 300) return "under_300px";
  if (edge < 800) return "300_799px";
  if (edge < 1400) return "800_1399px";
  if (edge < 2200) return "1400_2199px";
  return "2200px_plus";
}

function summarizeDimensions(summary) {
  const buckets = new Map();
  for (const sample of summary.dimensionSamples) {
    increment(buckets, dimensionBucket(sample));
  }
  return topMapEntries(buckets, 10);
}

function markdownTable(headers, rows) {
  if (!rows.length) return "_None._";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function serializableRoot(summary) {
  const derivativeSummary = derivativeRelationshipSummary(summary);
  return {
    key: summary.key,
    label: summary.label,
    root: summary.root,
    accessible: summary.accessible,
    known_size: summary.knownSize,
    file_count: summary.fileCount,
    total_bytes: summary.totalBytes,
    total_size: formatBytes(summary.totalBytes),
    image_files: summary.imageFiles,
    non_image_files: summary.nonImageFiles,
    extension_counts: Object.fromEntries(topMapEntries(summary.extCounts, 100)),
    derivative_counts: Object.fromEntries(topMapEntries(summary.derivativeCounts, 20)),
    distinct_building_ids: summary.buildingIds.size,
    average_files_per_building_id: summary.buildingIds.size ? Number((summary.patternMatches / summary.buildingIds.size).toFixed(2)) : null,
    distinct_building_ids_with_orig: summary.buildingOriginalCounts.size,
    derivative_relationships: derivativeSummary,
    oldest: summary.oldest,
    newest: summary.newest,
    largest_files: summary.largestFiles,
    dimension_sample_count: summary.dimensionSamples.length,
    dimension_buckets: Object.fromEntries(summarizeDimensions(summary)),
    pattern_matches: summary.patternMatches,
    pattern_misses: summary.patternMisses,
    errors: summary.errors.slice(0, 50),
  };
}

function generateMainReport(summaries) {
  const accessible = summaries.filter((summary) => summary.accessible);
  const inaccessible = summaries.filter((summary) => !summary.accessible);
  const lines = [];
  lines.push("# Media Corpus Inventory V1");
  lines.push("");
  lines.push("This report inventories the recovered Rofo production media corpus as a preservation and commercial-geography asset. It is intentionally inventory-only: no files were moved, optimized, deleted, uploaded, or rewritten.");
  lines.push("");
  lines.push("## Execution Status");
  lines.push("");
  if (accessible.length) {
    lines.push(`The inventory script successfully scanned ${accessible.length} configured root(s).`);
  }
  if (inaccessible.length) {
    lines.push(`The current execution environment could not access ${inaccessible.length} configured root(s). The script should be run on the Production APP EC2 instance where the EBS volumes are mounted.`);
    lines.push("");
    lines.push(markdownTable(["Root", "Expected path", "Known size", "Status"], inaccessible.map((summary) => [summary.key, summary.root, summary.knownSize || "", summary.errors[0] || "not accessible"])));
  }
  lines.push("");
  lines.push("## Configured Corpus Roots");
  lines.push("");
  lines.push(markdownTable(
    ["Corpus", "Path", "Accessible", "Files scanned", "Measured size", "Known size"],
    summaries.map((summary) => [
      summary.key,
      summary.root,
      summary.accessible ? "yes" : "no",
      formatNumber(summary.fileCount),
      summary.totalBytes ? formatBytes(summary.totalBytes) : "not scanned",
      summary.knownSize || "",
    ]),
  ));
  lines.push("");
  lines.push("## Confirmed Production Findings");
  lines.push("");
  lines.push("- `buildings5`: 620G total.");
  lines.push("- `buildings5/orig`: 342G total.");
  lines.push("- `buildings5/orig`: 337,050 files.");
  lines.push("- `buildings5/orig`: 175,670 distinct building IDs represented.");
  lines.push("- `listings4`: 84G total.");
  lines.push("- `pdfs`: 2.7G total.");
  lines.push("- Known image derivative folders: `orig`, `standard`, `thumb`, `smthumb`.");
  lines.push("- Observed filename convention: `{building_id}_{hash}.{ext}`.");
  lines.push("");
  lines.push("## Corpus Assessment");
  lines.push("");
  lines.push("The recovered media corpus has high strategic preservation value. The `buildings5/orig` volume alone suggests unusually broad historical building-level visual coverage, with enough scale to support representative commercial district imagery, building environment understanding, and curated editorial visualization.");
  lines.push("");
  lines.push("Representative buildings should remain presentation examples rather than the source of commercial intelligence. Media should support visual grounding after district identity has been validated through the broader raw corpus, provenance review, and editorial judgment.");
  lines.push("");
  lines.push("## Building Coverage");
  lines.push("");
  const buildings5 = summaries.find((summary) => summary.key === "buildings5");
  if (buildings5 && buildings5.accessible) {
    lines.push(`The building corpus scan found ${formatNumber(buildings5.buildingIds.size)} distinct building IDs across ${formatNumber(buildings5.patternMatches)} files matching the building media filename convention.`);
    lines.push("");
    lines.push(markdownTable(
      ["Building ID", "Files", "Orig files"],
      topMapEntries(buildings5.buildingIds, 15).map(([buildingId, count]) => [buildingId, formatNumber(count), formatNumber(buildings5.buildingOriginalCounts.get(buildingId) || 0)]),
    ));
  } else {
    lines.push("Live building-level coverage could not be recomputed in this environment. Based on confirmed production findings, `buildings5/orig` covers 175,670 distinct building IDs with 337,050 original files, or about 1.92 original files per represented building ID.");
  }
  lines.push("");
  lines.push("## Derivative Structure");
  lines.push("");
  if (buildings5 && buildings5.accessible) {
    const derivativeSummary = derivativeRelationshipSummary(buildings5);
    lines.push(markdownTable(
      ["Measure", "Value"],
      [
        ["Unique media hash groups", formatNumber(derivativeSummary.uniqueMediaHashes)],
        ["Groups with multiple derivatives", formatNumber(derivativeSummary.multiDerivative)],
        ["Groups with orig/standard/thumb/smthumb", formatNumber(derivativeSummary.allDerivatives)],
        ["Orig-only groups", formatNumber(derivativeSummary.origOnly)],
        ["Derivative groups without orig", formatNumber(derivativeSummary.noOrig)],
      ],
    ));
  } else {
    lines.push("The known derivative structure strongly suggests many reusable original assets plus lower-value generated derivatives. `orig` should be treated as the preservation source; `standard`, `thumb`, and `smthumb` should be considered convenience derivatives that can likely be regenerated later.");
  }
  lines.push("");
  lines.push("## Image Dimensions");
  lines.push("");
  const sampled = accessible.filter((summary) => summary.dimensionSamples.length);
  if (sampled.length) {
    for (const summary of sampled) {
      lines.push(`### ${summary.key}`);
      lines.push("");
      lines.push(markdownTable(["Dimension bucket", "Sample count"], summarizeDimensions(summary).map(([bucket, count]) => [bucket, formatNumber(count)])));
      lines.push("");
    }
  } else {
    lines.push("No dimension samples were collected in this environment. The script includes lightweight JPEG, PNG, GIF, and WebP header sampling for EC2 execution.");
  }
  lines.push("");
  lines.push("## Bay Area And District Imagery Potential");
  lines.push("");
  lines.push("Expected usefulness is high, but district-specific strength still needs a join between building IDs, addresses, city/neighborhood metadata, and the recovered media filenames. The most valuable next step is a media-to-building join that maps image assets to canonical building records and commercial district candidates.");
  lines.push("");
  lines.push("Likely strongest uses:");
  lines.push("");
  lines.push("- Representative commercial district imagery for Bay Area flagship districts.");
  lines.push("- Editorial building examples that support commercial identity without implying inventory completeness.");
  lines.push("- District visual QA, especially for Downtown Oakland, Uptown Oakland, Jack London Square, Financial District SF, Downtown Palo Alto, Mountain View, Redwood City, and South San Francisco.");
  lines.push("- Future corridor-level image briefs where building media can show built-form texture.");
  lines.push("");
  lines.push("## Preservation Strategy");
  lines.push("");
  lines.push("- Preserve `orig` as the canonical archival source.");
  lines.push("- Treat `standard`, `thumb`, and `smthumb` as derived assets until proven otherwise.");
  lines.push("- Keep source paths and filename hashes intact in manifests.");
  lines.push("- Generate content-addressed manifests before any migration.");
  lines.push("- Do not deduplicate destructively until a representative sample confirms derivative and duplicate patterns.");
  lines.push("");
  lines.push("## R2 Strategy");
  lines.push("");
  lines.push("- Start with manifest-first migration planning, not upload-first migration.");
  lines.push("- Use building ID and original hash as stable lookup keys.");
  lines.push("- Upload originals into an archival bucket/prefix first, then regenerate web derivatives through a controlled image pipeline.");
  lines.push("- Keep PDFs separate from image media because access, rendering, and preservation behavior differ.");
  lines.push("- Consider district pilot subsets before full corpus migration.");
  lines.push("");
  lines.push("## Risks And Unknowns");
  lines.push("");
  lines.push("- Some files may not follow `{building_id}_{hash}.{ext}`.");
  lines.push("- Some derivative folders may contain missing or stale derivatives.");
  lines.push("- File timestamps may reflect migration/copy activity rather than original upload date.");
  lines.push("- Listing media may duplicate building media or represent stale listing-specific assets.");
  lines.push("- Building IDs need a canonical join before district image strength can be assessed.");
  lines.push("- PDFs may include marketing flyers, outdated material, or broker documents that should not be surfaced publicly without review.");
  lines.push("");
  lines.push("## Confidence");
  lines.push("");
  lines.push("- High confidence: corpus scale, derivative folder names, filename convention, and preservation value.");
  lines.push("- Medium confidence: derivative regeneration strategy and representative district imagery usefulness.");
  lines.push("- Low confidence until EC2 scan and building join: Bay Area district-specific coverage, duplicate rates, and image quality distribution.");
  lines.push("");
  lines.push("## Next Recommended Infrastructure Step");
  lines.push("");
  lines.push("Run this inventory script on the mounted Production APP EC2 instance, then create Media-to-Building Join V1: a manifest that connects building media IDs to canonical building records, city/state, addresses, district candidates, and representative-image review status.");
  lines.push("");
  lines.push("Command:");
  lines.push("");
  lines.push("```bash");
  lines.push("node scripts/media/media_corpus_inventory_v1.js");
  lines.push("```");
  lines.push("");
  return lines.join("\n");
}

function generateExtensionReport(summaries) {
  const lines = ["# Media Extension Breakdown", ""];
  for (const summary of summaries) {
    lines.push(`## ${summary.key}`);
    lines.push("");
    if (!summary.accessible) {
      lines.push(`Not scanned: ${summary.errors[0] || "path unavailable"}`);
      lines.push("");
      continue;
    }
    lines.push(markdownTable(
      ["Extension", "Files", "Bytes"],
      topMapEntries(summary.extCounts, 50).map(([ext, count]) => [ext, formatNumber(count), formatBytes(summary.extBytes.get(ext) || 0)]),
    ));
    lines.push("");
    lines.push("### Derivatives");
    lines.push("");
    lines.push(markdownTable(
      ["Derivative", "Files", "Bytes"],
      topMapEntries(summary.derivativeCounts, 20).map(([derivative, count]) => [derivative, formatNumber(count), formatBytes(summary.derivativeBytes.get(derivative) || 0)]),
    ));
    lines.push("");
  }
  return lines.join("\n");
}

function generateBuildingCoverageReport(summaries) {
  const buildings5 = summaries.find((summary) => summary.key === "buildings5");
  const lines = ["# Media Building Coverage Summary", ""];
  if (!buildings5 || !buildings5.accessible) {
    lines.push("The building media root was not accessible in this environment, so live coverage was not recomputed.");
    lines.push("");
    lines.push("Confirmed production baseline:");
    lines.push("");
    lines.push("- `buildings5/orig` files: 337,050");
    lines.push("- Distinct building IDs represented in `buildings5/orig`: 175,670");
    lines.push("- Average original images per represented building ID: 1.92");
    lines.push("");
    lines.push("Interpretation: this is a strategically valuable building-level image base, but it should be joined to canonical building records before any public district imagery workflow uses it.");
    return lines.join("\n");
  }

  lines.push(`Scanned files matching building media pattern: ${formatNumber(buildings5.patternMatches)}.`);
  lines.push(`Distinct building IDs: ${formatNumber(buildings5.buildingIds.size)}.`);
  lines.push(`Average files per building ID: ${buildings5.buildingIds.size ? (buildings5.patternMatches / buildings5.buildingIds.size).toFixed(2) : "n/a"}.`);
  lines.push(`Distinct building IDs with orig files: ${formatNumber(buildings5.buildingOriginalCounts.size)}.`);
  lines.push("");
  lines.push("## Largest Represented Building IDs");
  lines.push("");
  lines.push(markdownTable(
    ["Building ID", "All files", "Orig files"],
    topMapEntries(buildings5.buildingIds, 50).map(([buildingId, count]) => [buildingId, formatNumber(count), formatNumber(buildings5.buildingOriginalCounts.get(buildingId) || 0)]),
  ));
  lines.push("");
  lines.push("## Largest Files");
  lines.push("");
  lines.push(markdownTable(
    ["File", "Size", "Derivative", "Extension"],
    buildings5.largestFiles.map((file) => [file.filePath, formatBytes(file.bytes), file.derivative, file.ext]),
  ));
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv);
  ensureDir(options.reportDir);
  ensureDir(options.sampleDir);

  const summaries = [];
  for (const root of options.roots) {
    console.error(`Scanning ${root.key}: ${root.root}`);
    summaries.push(await analyzeRoot(root, options));
  }

  const serializable = summaries.map(serializableRoot);
  writeJson(path.join(options.sampleDir, "media_corpus_inventory_v1_summary.json"), {
    generated_at: new Date().toISOString(),
    roots: serializable,
  });

  for (const summary of summaries) {
    writeJson(path.join(options.sampleDir, `${summary.key}_sample_manifest.json`), {
      generated_at: new Date().toISOString(),
      key: summary.key,
      root: summary.root,
      accessible: summary.accessible,
      samples: summary.sampleFiles,
      dimension_samples: summary.dimensionSamples,
    });
  }

  fs.writeFileSync(path.join(options.reportDir, "media_corpus_inventory_v1.md"), `${generateMainReport(summaries)}\n`);
  fs.writeFileSync(path.join(options.reportDir, "media_extension_breakdown.md"), `${generateExtensionReport(summaries)}\n`);
  fs.writeFileSync(path.join(options.reportDir, "media_building_coverage_summary.md"), `${generateBuildingCoverageReport(summaries)}\n`);

  console.error(`Wrote reports to ${options.reportDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
