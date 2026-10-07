import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetOverviewResponse,
  GetResourceParams,
  GetResourceResponse,
  ListResourcesQueryParams,
  ListResourcesResponse,
  MatchResourcesBody,
  MatchResourcesResponse,
} from "@workspace/api-zod";
import { db, resourcesTable } from "@workspace/db";

const router: IRouter = Router();

const stopWords = new Set([
  "a",
  "an",
  "and",
  "for",
  "from",
  "help",
  "i",
  "in",
  "me",
  "my",
  "need",
  "of",
  "please",
  "the",
  "to",
  "with",
]);

function getSearchTerms(value: string): string[] {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 && !stopWords.has(term));
}

router.get("/resources", async (req, res): Promise<void> => {
  const query = ListResourcesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(resourcesTable)
    .orderBy(asc(resourcesTable.name));
  const searchText = query.data.query?.trim().toLocaleLowerCase();
  const searchTerms = searchText ? getSearchTerms(searchText) : [];
  const category = query.data.category?.trim().toLocaleLowerCase();
  const location = query.data.location?.trim().toLocaleLowerCase();
  const resources = rows.filter((resource) => {
    const resourceText = [
      resource.name,
      resource.category,
      resource.description,
      resource.provider,
      resource.location,
      resource.address,
      resource.eligibility,
      ...resource.tags,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!searchText ||
        resourceText.includes(searchText) ||
        searchTerms.some((term) => resourceText.includes(term))) &&
      (!category || resource.category.toLocaleLowerCase() === category) &&
      (!location ||
        resource.location.toLocaleLowerCase().includes(location) ||
        resource.tags.some((tag) => tag.toLocaleLowerCase().includes(location)))
    );
  });

  res.json(ListResourcesResponse.parse(resources));
});

router.get("/resources/:id", async (req, res): Promise<void> => {
  const params = GetResourceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [resource] = await db
    .select()
    .from(resourcesTable)
    .where(eq(resourcesTable.id, params.data.id));

  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  res.json(GetResourceResponse.parse(resource));
});

router.post("/resources/match", async (req, res): Promise<void> => {
  const body = MatchResourcesBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const resources = await db.select().from(resourcesTable);
  const terms = getSearchTerms(body.data.need);
  const requestedLocation = body.data.location?.trim().toLocaleLowerCase();

  const matches = resources
    .map((resource) => {
      const category = resource.category.toLocaleLowerCase();
      const tags = resource.tags.map((tag) => tag.toLocaleLowerCase());
      const title = resource.name.toLocaleLowerCase();
      const searchableText = [
        resource.name,
        resource.category,
        resource.description,
        resource.eligibility,
        ...resource.tags,
      ]
        .join(" ")
        .toLocaleLowerCase();
      const matchedTerms = terms.filter((term) => searchableText.includes(term));
      const tagMatches = tags.filter((tag) =>
        terms.some((term) => tag.includes(term) || term.includes(tag)),
      );
      const locationMatches =
        requestedLocation &&
        (resource.location.toLocaleLowerCase().includes(requestedLocation) ||
          resource.tags.some((tag) =>
            tag.toLocaleLowerCase().includes(requestedLocation),
          ));

      let score =
        matchedTerms.length * 12 +
        tagMatches.length * 7 +
        (locationMatches ? 10 : 0);
      if (terms.some((term) => title.includes(term))) score += 8;
      if (terms.some((term) => category.includes(term))) score += 8;
      score = Math.min(score, 99);

      const reasonParts: string[] = [];
      if (tagMatches.length > 0) {
        reasonParts.push(`Related to ${tagMatches.slice(0, 2).join(" and ")}`);
      } else if (matchedTerms.length > 0) {
        reasonParts.push(`The listing mentions ${matchedTerms.slice(0, 2).join(" and ")}`);
      }
      if (locationMatches) reasonParts.push(`serving ${resource.location}`);
      else reasonParts.push(`available in ${resource.location}`);

      return {
        resource,
        score,
        reason: `${reasonParts.join("; ")}.`,
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.resource.name.localeCompare(b.resource.name))
    .slice(0, 6);

  res.json(MatchResourcesResponse.parse({ matches }));
});

router.get("/overview", async (_req, res): Promise<void> => {
  const resources = await db.select().from(resourcesTable);
  const categories = [...new Set(resources.map((resource) => resource.category))].sort(
    (a, b) => a.localeCompare(b),
  );

  res.json(
    GetOverviewResponse.parse({
      resourceCount: resources.length,
      categoryCount: categories.length,
      featuredCount: resources.filter((resource) => resource.featured).length,
      categories,
    }),
  );
});

export default router;
