import { XMLParser } from "fast-xml-parser";

import DisasterAlert from "../models/disasterAlert.model.js";
import { notifyWarningTargets } from "./disasterWarningNotification.service.js";
import { broadcastDisasterWarning } from "./disasterWarningSocket.service.js";

const SACHET_KARNATAKA_RSS_URL =
    "https://sachet.ndma.gov.in/cap_public_website/rss/rss_karnataka.xml";

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    trimValues: true,
    removeNSPrefix: true
});

// Temporary in-memory ETag cache.
// We will move this to persistent storage later.
let cachedETag = null;
let cachedRSS = null;

const getValue = (value) => {
    if (value == null) return null;

    if (typeof value === "object" && "#text" in value) {
        return value["#text"];
    }

    return value;
};

const toArray = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

const parseNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const parseDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
};

const extractIdentifierFromLink = (link) => {
    if (!link) return null;

    try {
        const url = new URL(link);
        return url.searchParams.get("identifier");
    } catch {
        const match = String(link).match(
            /identifier=([^&]+)/i
        );

        return match ? match[1] : null;
    }
};

const extractRSSItems = (rssXml) => {
    const parsed = parser.parse(rssXml);

    const channel = parsed?.rss?.channel;

    if (!channel) {
        throw new Error(
            "Invalid SACHET RSS response: RSS channel not found"
        );
    }

    return toArray(channel.item);
};

const fetchRSSFeed = async () => {
    const headers = {};

    if (cachedETag) {
        headers["If-None-Match"] = cachedETag;
    }

    const response = await fetch(
        SACHET_KARNATAKA_RSS_URL,
        {
            method: "GET",
            headers
        }
    );

    if (response.status === 304) {
        return {
            changed: false,
            xml: cachedRSS
        };
    }

    if (!response.ok) {
        throw new Error(
            `SACHET RSS request failed: ${response.status} ${response.statusText}`
        );
    }

    const xml = await response.text();

    const newETag = response.headers.get("etag");

    cachedRSS = xml;
    cachedETag = newETag;

    return {
        changed: true,
        xml
    };
};

const fetchCAPXML = async (identifier) => {
    const url =
        `https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=${encodeURIComponent(identifier)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `SACHET CAP request failed for ${identifier}: ${response.status} ${response.statusText}`
        );
    }

    return await response.text();
};

const parseCAPWarning = (xml, fallbackItem = {}) => {
    const parsed = parser.parse(xml);

    const alert = parsed?.alert;

    if (!alert) {
        throw new Error(
            "Invalid SACHET CAP XML: <alert> element not found"
        );
    }

    const info = toArray(alert.info)[0];

    if (!info) {
        throw new Error(
            "Invalid SACHET CAP XML: <info> element not found"
        );
    }

    const area = toArray(info.area)[0] || {};

    const identifier =
        getValue(alert.identifier) ||
        extractIdentifierFromLink(
            getValue(fallbackItem.link)
        );

    const headline =
        getValue(info.headline) ||
        getValue(alert.headline) ||
        getValue(fallbackItem.title) ||
        "SACHET Disaster Warning";

    const description =
        getValue(info.description) ||
        getValue(fallbackItem.description) ||
        headline;

    const instruction =
        getValue(info.instruction) || "";

    const event =
        getValue(info.event) ||
        "OTHER";

    const severity =
        String(
            getValue(info.severity) || "MODERATE"
        ).toUpperCase();

    const effective =
        parseDate(getValue(info.effective));

    const expires =
        parseDate(getValue(info.expires));

    const areaName =
        getValue(area.areaDesc) ||
        null;

    const geocodes = toArray(area.geocode);

    const districtCodes = geocodes
        .filter((geocode) => {
            const valueName = String(
                getValue(geocode.valueName) || ""
            )
                .trim()
                .toLowerCase();

            return valueName === "lgd district code";
        })
        .map((geocode) => {
            return String(
                getValue(geocode.value) || ""
            ).trim();
        })
        .filter(Boolean);
    console.log(
        "SACHET district codes:",
        districtCodes
    );
    let latitude = null;
    let longitude = null;
    let radiusKm = 15;

    const circle = getValue(area.circle);

    if (circle) {
        const circleParts = String(circle)
            .trim()
            .split(/\s+/);

        if (circleParts.length >= 2) {
            const coordinates =
                circleParts[0].split(",");

            latitude =
                parseNumber(coordinates[0]);

            longitude =
                parseNumber(coordinates[1]);

            const radiusMeters =
                parseNumber(circleParts[1]);

            if (radiusMeters != null) {
                radiusKm =
                    radiusMeters / 1000;
            }
        }
    }

    const instructions = instruction
        ? String(instruction)
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    return {
        externalId: String(identifier),

        districtCodes,

        title: String(headline),

        message: String(description),

        disasterType: mapDisasterType(event),

        severity: mapSeverity(severity),

        source: "SACHET",

        areaName,

        instructions,

        location: {
            latitude,
            longitude,
            radiusKm
        },

        active: true,

        expiresAt: expires,

        effectiveAt: effective
    };
};

const mapSeverity = (severity) => {
    const value = String(severity).toUpperCase();

    const allowed = [
        "LOW",
        "MODERATE",
        "HIGH",
        "CRITICAL"
    ];

    if (allowed.includes(value)) {
        return value;
    }

    return "MODERATE";
};

const mapDisasterType = (event) => {
    const value = String(event)
        .toUpperCase()
        .trim();

    if (value.includes("FLOOD")) {
        return "FLOOD";
    }

    if (
        value.includes("LANDSLIDE") ||
        value.includes("LAND SLIDE")
    ) {
        return "LANDSLIDE";
    }

    if (
        value.includes("THUNDERSTORM") ||
        value.includes("LIGHTNING") ||
        value.includes("DUSTSTORM") ||
        value.includes("SQUALL")
    ) {
        return "CYCLONE_STORM";
    }

    if (
        value.includes("CYCLONE") ||
        value.includes("STORM")
    ) {
        return "CYCLONE_STORM";
    }

    if (value.includes("EARTHQUAKE")) {
        return "EARTHQUAKE";
    }

    if (value.includes("FIRE")) {
        return "FIRE";
    }

    if (
        value.includes("HEAT") ||
        value.includes("COLD")
    ) {
        return "OTHER";
    }

    return "OTHER";
};

const processCAPWarning = async (
    capWarning
) => {
    const existing =
        await DisasterAlert.findOne({
            externalId: capWarning.externalId
        });

    if (existing) {
        let updated = false;

        if (
            capWarning.districtCodes?.length &&
            (!existing.districtCodes ||
                existing.districtCodes.length === 0)
        ) {
            existing.districtCodes =
                capWarning.districtCodes;

            updated = true;
        }

        if (
            capWarning.instructions?.length &&
            (!existing.instructions ||
                existing.instructions.length === 0)
        ) {
            existing.instructions =
                capWarning.instructions;

            updated = true;
        }

        if (
            capWarning.areaName &&
            !existing.areaName
        ) {
            existing.areaName =
                capWarning.areaName;

            updated = true;
        }

        if (updated) {
            await existing.save();
        }

        return {
            duplicate: true,
            updated,
            alert: existing
        };
    }

    const alert =
        await DisasterAlert.create({
            type: "DISASTER_WARNING",

            title: capWarning.title,

            message: capWarning.message,

            disasterType:
                capWarning.disasterType,

            source: "SACHET",

            externalId:
                capWarning.externalId,

            areaName:
                capWarning.areaName,

            districtCodes:
                capWarning.districtCodes,

            instructions:
                capWarning.instructions,

            location:
                capWarning.location,

            severity:
                capWarning.severity,

            active:
                capWarning.active,

            expiresAt:
                capWarning.expiresAt
        });

    const notificationResult =
        await notifyWarningTargets(alert);

    const socketResult =
        broadcastDisasterWarning(
            alert,
            notificationResult.targetRecords
        );

    delete notificationResult.targetRecords;

    return {
        duplicate: false,

        alert,

        notificationResult,

        socketResult
    };
};

export const syncSachetKarnatakaWarnings =
    async () => {
        const feed =
            await fetchRSSFeed();

        if (!feed.changed && !feed.xml) {
            return {
                success: true,
                changed: false,
                message:
                    "SACHET RSS has not changed and no cached feed is available.",
                processed: 0
            };
        }

        if (!feed.xml) {
            return {
                success: true,
                changed: false,
                message:
                    "SACHET RSS has not changed.",
                processed: 0
            };
        }

        const items =
            extractRSSItems(feed.xml);

        const results = [];

        for (const item of items) {
            try {
                const link =
                    getValue(item.link);

                const identifier =
                    extractIdentifierFromLink(
                        link
                    );

                if (!identifier) {
                    results.push({
                        success: false,
                        skipped: true,
                        reason:
                            "No CAP identifier found",
                        title:
                            getValue(item.title)
                    });

                    continue;
                }

                const capXML =
                    await fetchCAPXML(
                        identifier
                    );

                console.log(
                    `SACHET CAP response for ${identifier}:`,
                    capXML.substring(0, 500)
                );

                const warning =
                    parseCAPWarning(
                        capXML,
                        item
                    );

                const result =
                    await processCAPWarning(
                        warning
                    );

                results.push({
                    success: true,
                    identifier,
                    ...result
                });

            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    title:
                        getValue(item.title)
                });
            }
        }

        return {
            success: true,

            changed: feed.changed,

            feed:
                SACHET_KARNATAKA_RSS_URL,

            processed:
                results.length,

            created:
                results.filter(
                    (item) =>
                        item.success &&
                        item.duplicate === false
                ).length,

            duplicates:
                results.filter(
                    (item) =>
                        item.success &&
                        item.duplicate === true
                ).length,

            failed:
                results.filter(
                    (item) =>
                        item.success === false
                ).length,

            results
        };
    };