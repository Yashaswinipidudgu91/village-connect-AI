import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import {
  ArrowLeft, ArrowRight, Bookmark, ChevronDown, Clock3, ExternalLink, Filter,
  Heart, MapPin, Menu, Phone, Search, Sparkles, Sprout, X
} from 'lucide-react';
import type { Resource, ResourceMatch } from '@workspace/api-client-react';
import {
  getGetOverviewQueryKey, getGetResourceQueryKey, getHealthCheckQueryKey,
  getListResourcesQueryKey, useGetOverview, useGetResource, useHealthCheck,
  useListResources, useMatchResources
} from '@workspace/api-client-react';
import './index.css';

const queryClient = new QueryClient();
const savedKey = 'village-connect-saved-v1';

function readSaved(): number[] {
  try {
    const value = localStorage.getItem(savedKey);
    return value ? JSON.parse(value) as number[] : [];
  } catch {
    return [];
  }
}

function useSavedResources() {
  const [saved, setSaved] = useState<number[]>([]);
  useEffect(() => setSaved(readSaved()), []);
  const toggle = (id: number) => setSaved(current => {
    const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
    localStorage.setItem(savedKey, JSON.stringify(next));
    return next;
  });
  return { saved, toggle };
}

function Header({ savedCount }: { savedCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  return (
    <header className="border-b border-border/80 bg-background/90">
      <div className="site-shell flex h-[76px] items-center justify-between">
        <Link href="/" className="group flex items-center gap-3 text-foreground no-underline" data-testid="link-home">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary text-primary-foreground">
            <Sprout size={21} strokeWidth={1.8} />
          </span>
          <span className="leading-tight">
            <span className="serif block text-[21px] font-semibold tracking-[-.035em]">VillageConnect<span className="text-accent">AI</span></span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.19em] text-muted-foreground">Good help, close to home</span>
          </span>
        </Link>
        <div className="flex items-center gap-7">
          <nav aria-label="Main navigation" className={`${menuOpen ? 'absolute left-0 right-0 top-[75px] z-30 flex flex-col border-b border-border bg-background px-5 py-4 shadow-lg' : 'hidden'} md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            <Link href="/" onClick={() => setMenuOpen(false)} className={`py-2 text-sm font-semibold no-underline ${location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-directory">Find support</Link>
            <Link href="/saved" onClick={() => setMenuOpen(false)} className={`flex items-center gap-2 py-2 text-sm font-semibold no-underline ${location === '/saved' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-saved">
              Saved {savedCount > 0 && <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-secondary px-1 text-[10px] text-secondary-foreground">{savedCount}</span>}
            </Link>
          </nav>
          <button className="rounded-lg p-2 text-foreground md:hidden" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function SaveButton({ resource, saved, toggle, compact = false }: { resource: Resource; saved: boolean; toggle: (id: number) => void; compact?: boolean }) {
  return (
    <button
      type="button" onClick={() => toggle(resource.id)}
      aria-label={saved ? `Remove ${resource.name} from saved resources` : `Save ${resource.name}`}
      aria-pressed={saved}
      className={`saved-heart inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary ${compact ? 'h-10 w-10' : 'px-4 py-2.5'}`}
      data-testid={`button-save-${resource.id}`}
    >
      <Heart size={17} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-accent' : ''} />
      {!compact && <span>{saved ? 'Saved' : 'Save for later'}</span>}
    </button>
  );
}

function ListingCard({ resource, saved, toggle, matchReason }: { resource: Resource; saved: boolean; toggle: (id: number) => void; matchReason?: string }) {
  return (
    <article className="card-hover flex h-full flex-col rounded-[18px] border border-border bg-card p-5 sm:p-6" data-testid={`card-resource-${resource.id}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-[#e9eee5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-primary dark:bg-secondary">{resource.category}</span>
        <SaveButton resource={resource} saved={saved} toggle={toggle} compact />
      </div>
      <Link href={`/resources/${resource.id}`} className="group text-foreground no-underline" data-testid={`link-resource-${resource.id}`}>
        <h3 className="serif text-[23px] font-semibold leading-[1.15] tracking-[-.025em] group-hover:text-primary">{resource.name}</h3>
      </Link>
      <p className="mt-3 line-clamp-3 text-[14px] leading-[1.7] text-muted-foreground">{resource.description}</p>
      {matchReason && <p className="mt-3 rounded-lg bg-[#f0f2e9] px-3 py-2 text-[13px] leading-relaxed text-primary dark:bg-secondary" data-testid={`text-match-reason-${resource.id}`}>{matchReason}</p>}
      <div className="mt-5 flex items-start gap-2 text-[13px] text-foreground/75">
        <MapPin size={15} className="mt-0.5 shrink-0 text-accent" />
        <span>{resource.location}</span>
      </div>
      <div className="mt-auto flex items-end justify-between gap-2 pt-5">
        <div>
          <p className="text-[11px] uppercase tracking-[.12em] text-muted-foreground">From</p>
          <p className="mt-1 text-[13px] font-semibold">{resource.provider}</p>
        </div>
        <Link href={`/resources/${resource.id}`} className="inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-[13px] font-bold text-primary no-underline hover:bg-secondary/70" data-testid={`link-details-${resource.id}`}>
          Details <ArrowRight size={15} />
        </Link>
      </div>
      {resource.deadline && <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground"><Clock3 size={14} /> Apply by {resource.deadline}</div>}
    </article>
  );
}

function ResourceGrid({ resources, saved, toggle, reasons, loading }: { resources: Resource[]; saved: number[]; toggle: (id: number) => void; reasons?: Map<number, string>; loading?: boolean }) {
  if (loading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading resources" aria-busy="true">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[258px] animate-pulse rounded-[18px] border border-border bg-card/80 p-6"><div className="h-6 w-24 rounded-full bg-muted" /><div className="mt-7 h-7 w-4/5 rounded bg-muted" /><div className="mt-4 h-3 w-full rounded bg-muted" /><div className="mt-2 h-3 w-3/4 rounded bg-muted" /></div>)}</div>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {resources.map(resource => <ListingCard key={resource.id} resource={resource} saved={saved.includes(resource.id)} toggle={toggle} matchReason={reasons?.get(resource.id)} />)}
    </div>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="rounded-[20px] border border-dashed border-border bg-card/60 px-6 py-14 text-center">
    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary"><Bookmark size={21} /></span>
    <h3 className="serif mt-5 text-2xl font-semibold">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>;
}

function ErrorState({ retry, message = 'We could not load the directory just now.' }: { retry: () => void; message?: string }) {
  return <div role="alert" className="rounded-2xl border border-[#d8a494] bg-[#fbf0eb] p-6 text-center">
    <p className="font-semibold text-foreground">{message}</p>
    <p className="mt-1 text-sm text-muted-foreground">Please check your connection and try again.</p>
    <button onClick={retry} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground" type="button" data-testid="button-retry">Try again</button>
  </div>;
}

function DirectoryPage({ saved, toggle }: { saved: number[]; toggle: (id: number) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [need, setNeed] = useState('');
  const [matchLocation, setMatchLocation] = useState('');
  const [matching, setMatching] = useState(false);
  const params = useMemo(() => ({
    ...(query.trim() ? { query: query.trim() } : {}),
    ...(category ? { category } : {}),
    ...(location.trim() ? { location: location.trim() } : {}),
  }), [query, category, location]);
  const resourcesQuery = useListResources(params, { query: { queryKey: getListResourcesQueryKey(params) } });
  const overviewQuery = useGetOverview({ query: { queryKey: getGetOverviewQueryKey() } });
  const healthQuery = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60_000 } });
  const matchMutation = useMatchResources();
  const resources = resourcesQuery.data ?? [];
  const matches = matchMutation.data?.matches;
  const matchReasons = useMemo(() => new Map((matches ?? []).map(item => [item.resource.id, item.reason])), [matches]);

  const submitNeed = (event: FormEvent) => {
    event.preventDefault();
    if (need.trim().length < 3) return;
    setMatching(true);
    matchMutation.mutate({ data: { need: need.trim(), ...(matchLocation.trim() ? { location: matchLocation.trim() } : {}) } }, {
      onSuccess: () => setMatching(false),
      onError: () => setMatching(false),
    });
  };
  const clearFilters = () => { setQuery(''); setCategory(''); setLocation(''); };

  return (
    <>
      <section className="topographic text-[#f6f0df]">
        <div className="site-shell grid min-h-[424px] items-center gap-10 py-12 md:grid-cols-[1.1fr_.9fr] md:py-[68px]">
          <div className="enter max-w-[620px]">
            <p className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-[#d8d6bd]"><span className="h-px w-7 bg-[#d6b17c]" /> A local guide to what’s possible</p>
            <h1 className="serif max-w-[650px] text-[42px] font-medium leading-[1.04] tracking-[-.045em] sm:text-[57px] lg:text-[66px]">A little help can make a <span className="italic text-[#dfc699]">big difference.</span></h1>
            <p className="mt-6 max-w-[510px] text-[16px] leading-[1.75] text-[#e1e5d9]">Find nearby support, practical services, and fresh opportunities—chosen with real life in mind.</p>
            <a href="#directory" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f3ead6] px-5 py-3 text-sm font-bold text-[#284a39] no-underline hover:bg-white" data-testid="link-explore">Explore local resources <ArrowRight size={16} /></a>
          </div>
          <form onSubmit={submitNeed} className="enter-delay relative rounded-[22px] border border-white/20 bg-[#f7f3e8] p-5 text-foreground shadow-[0_18px_50px_rgba(17,36,27,.25)] sm:p-7" aria-label="Guided resource matching">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6eade] text-primary"><Sparkles size={19} /></span>
              <div><p className="serif text-[22px] font-semibold">Tell us what would help</p><p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">We match your words with the directory’s categories and tags.</p></div>
            </div>
            <label htmlFor="need" className="mb-2 mt-5 block text-[12px] font-bold uppercase tracking-[.1em] text-foreground/75">What are you looking for?</label>
            <textarea id="need" value={need} onChange={e => setNeed(e.target.value)} rows={2} maxLength={1000} placeholder="For example, help getting to medical appointments" className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-[14px] leading-relaxed placeholder:text-muted-foreground/70" data-testid="input-need" />
            <label htmlFor="match-location" className="mb-2 mt-4 block text-[12px] font-bold uppercase tracking-[.1em] text-foreground/75">Near (optional)</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1"><MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input id="match-location" value={matchLocation} onChange={e => setMatchLocation(e.target.value)} maxLength={120} placeholder="Town, village, or postcode" className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-3 text-[14px] placeholder:text-muted-foreground/70" data-testid="input-match-location" /></div>
              <button disabled={need.trim().length < 3 || matching || matchMutation.isPending} type="submit" className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-find-match">
                {matching || matchMutation.isPending ? 'Looking…' : 'Find a match'} <ArrowRight size={16} />
              </button>
            </div>
            {matchMutation.isError && <p role="alert" className="mt-3 text-sm text-[#9b3e30]">We couldn’t find matches at the moment. Please try again.</p>}
            <p className="mt-3 text-[11px] text-muted-foreground">Your search stays private. You can browse every listing below.</p>
          </form>
        </div>
      </section>

      <main id="directory" className="site-shell pb-20 pt-12 sm:pt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-accent">The local directory</p>
            <h2 className="serif mt-2 text-[35px] font-semibold tracking-[-.035em] sm:text-[42px]">Find what you need.</h2>
            <p className="mt-2 text-sm text-muted-foreground">Practical support from people and organisations in your area.</p>
          </div>
          <div className="flex gap-5 border-l border-border pl-5">
            {overviewQuery.data ? <>
              <div><p className="serif text-2xl font-semibold">{overviewQuery.data.resourceCount}</p><p className="text-[11px] text-muted-foreground">local resources</p></div>
              <div><p className="serif text-2xl font-semibold">{overviewQuery.data.categoryCount}</p><p className="text-[11px] text-muted-foreground">ways to get help</p></div>
            </> : <div className="h-11 w-28 animate-pulse rounded bg-muted" aria-label="Loading overview" />}
          </div>
        </div>

        <div className="mb-8 rounded-[18px] border border-border bg-card/80 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1.3fr_.9fr_.85fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search resources</span><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by service or keyword" className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm placeholder:text-muted-foreground" data-testid="input-search" />
            </label>
            <label className="relative block">
              <span className="sr-only">Filter by category</span><Filter size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-9 text-sm text-foreground" data-testid="select-category">
                <option value="">Every category</option>{(overviewQuery.data?.categories ?? []).map(item => <option key={item} value={item}>{item}</option>)}
              </select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </label>
            <label className="relative block">
              <span className="sr-only">Filter by location</span><MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Town or postcode" className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm placeholder:text-muted-foreground" data-testid="input-location" />
            </label>
            <button type="button" onClick={clearFilters} disabled={!query && !category && !location} className="h-12 rounded-xl border border-border px-4 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-40" data-testid="button-clear-filters">Clear</button>
          </div>
        </div>

        {matches && (
          <section className="mb-10 rounded-[20px] border border-[#c8d2bf] bg-[#eaf0e5] p-5 sm:p-7" aria-live="polite" data-testid="section-matches">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">A thoughtful starting point</p><h3 className="serif mt-2 text-2xl font-semibold">Here are a few possibilities.</h3><p className="mt-1 text-sm text-muted-foreground">These suggestions are based on what you told us. You can check each detail before reaching out.</p></div>
              <button onClick={() => matchMutation.reset()} className="rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-card" type="button" data-testid="button-dismiss-matches">Back to all resources</button>
            </div>
            {matches.length ? <div className="mt-5"><ResourceGrid resources={matches.map(match => match.resource)} saved={saved} toggle={toggle} reasons={matchReasons} /></div> : <p className="mt-5 rounded-xl bg-card p-5 text-sm text-muted-foreground">We didn’t find a close match for that description. Try another phrase, or browse all local resources below.</p>}
          </section>
        )}

        <div className="mb-5 flex items-center justify-between">
          <h3 className="serif text-[24px] font-semibold">{category || query || location ? 'Resources for your search' : 'Browse nearby support'}</h3>
          {!resourcesQuery.isLoading && !resourcesQuery.isError && <p className="text-xs text-muted-foreground" data-testid="text-result-count">{resources.length} {resources.length === 1 ? 'listing' : 'listings'}</p>}
        </div>
        {resourcesQuery.isError ? <ErrorState retry={() => void resourcesQuery.refetch()} /> :
          resourcesQuery.isLoading ? <ResourceGrid resources={[]} saved={saved} toggle={toggle} loading /> :
            resources.length ? <ResourceGrid resources={resources} saved={saved} toggle={toggle} /> :
              <EmptyState title="Nothing just yet" body="No listings match those filters. Try a nearby town, another category, or clear your search." action={<button onClick={clearFilters} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground" type="button" data-testid="button-empty-clear">Show all resources</button>} />}
        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
          <p>Local knowledge, thoughtfully brought together.</p>
          <p className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${healthQuery.data?.status ? 'bg-[#568163]' : healthQuery.isError ? 'bg-accent' : 'bg-[#c2a669]'}`} /> Directory {healthQuery.data?.status ? 'available' : healthQuery.isError ? 'temporarily unavailable' : 'checking connection'}</p>
        </footer>
      </main>
    </>
  );
}

function DetailPage({ saved, toggle }: { saved: number[]; toggle: (id: number) => void }) {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const validId = Number.isFinite(id) && id > 0;
  const resourceQuery = useGetResource(validId ? id : 0, { query: { enabled: validId, queryKey: getGetResourceQueryKey(validId ? id : 0) } });
  if (!validId) return <NotFoundPage />;
  if (resourceQuery.isLoading) return <main className="site-shell min-h-[65vh] py-14"><div className="h-8 w-36 animate-pulse rounded bg-muted" /><div className="mt-9 h-16 max-w-2xl animate-pulse rounded bg-muted" /><div className="mt-4 h-4 max-w-xl animate-pulse rounded bg-muted" /><div className="mt-12 h-72 animate-pulse rounded-[20px] bg-card" /></main>;
  if (resourceQuery.isError) return <main className="site-shell min-h-[65vh] py-14"><ErrorState retry={() => void resourceQuery.refetch()} message="This resource could not be opened." /></main>;
  const resource = resourceQuery.data;
  if (!resource) return <main className="site-shell min-h-[65vh] py-14"><EmptyState title="Listing not found" body="This resource may have been removed or the link may be out of date." action={<Link href="/" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground no-underline">Return to directory <ArrowRight size={15} /></Link>} /></main>;
  const contactHref = resource.contact.includes('@') ? `mailto:${resource.contact}` : `tel:${resource.contact.replace(/[^\d+]/g, '')}`;
  return (
    <main className="site-shell min-h-[78vh] pb-16 pt-9 sm:pt-14">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary no-underline hover:underline" data-testid="link-back-directory"><ArrowLeft size={16} /> All resources</Link>
      <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-16">
        <article>
          <span className="rounded-full bg-[#e9eee5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-primary dark:bg-secondary">{resource.category}</span>
          <h1 className="serif mt-5 max-w-3xl text-[42px] font-semibold leading-[1.07] tracking-[-.04em] sm:text-[56px]" data-testid={`text-resource-name-${resource.id}`}>{resource.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{resource.provider}</span><span className="inline-flex items-center gap-1.5"><MapPin size={15} className="text-accent" />{resource.location}</span></div>
          <div className="mt-8 h-px bg-border" />
          <section className="mt-8"><h2 className="serif text-2xl font-semibold">About this support</h2><p className="mt-4 whitespace-pre-line text-[15px] leading-[1.85] text-foreground/80">{resource.description}</p></section>
          <section className="mt-9 rounded-[18px] border border-border bg-card p-5 sm:p-6"><h2 className="serif text-2xl font-semibold">Who can access it?</h2><p className="mt-3 text-[15px] leading-[1.8] text-muted-foreground">{resource.eligibility}</p></section>
          {resource.tags.length > 0 && <section className="mt-8"><h2 className="serif text-xl font-semibold">Good to know</h2><div className="mt-3 flex flex-wrap gap-2">{resource.tags.map(tag => <span key={tag} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">{tag}</span>)}</div></section>}
        </article>
        <aside className="h-fit rounded-[20px] border border-border bg-card p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-accent">Take the next step</p>
          <h2 className="serif mt-2 text-[25px] font-semibold">Connect with {resource.provider}</h2>
          {resource.deadline && <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#f5eadc] p-3.5 text-sm dark:bg-secondary"><Clock3 size={17} className="mt-0.5 text-accent" /><div><p className="font-bold">Deadline</p><p className="mt-1 text-muted-foreground">{resource.deadline}</p></div></div>}
          <div className="mt-5 space-y-4 border-y border-border py-5">
            <div><p className="text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">Where</p><p className="mt-1.5 flex items-start gap-2 text-sm leading-relaxed"><MapPin size={15} className="mt-0.5 shrink-0 text-accent" />{resource.address}</p><p className="ml-[23px] mt-1 text-xs text-muted-foreground">{resource.location}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">Get in touch</p><a href={contactHref} className="mt-1.5 inline-flex items-center gap-2 break-all text-sm font-semibold text-primary hover:underline" data-testid={`link-contact-${resource.id}`}><Phone size={15} />{resource.contact}</a></div>
          </div>
          <div className="mt-5 space-y-3">
            <a href={contactHref} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground no-underline hover:opacity-90" data-testid={`button-contact-${resource.id}`}>Contact provider <ArrowRight size={16} /></a>
            {resource.website && <a href={resource.website} target="_blank" rel="noreferrer" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-foreground no-underline hover:bg-secondary" data-testid={`link-website-${resource.id}`}>Visit their website <ExternalLink size={15} /></a>}
            <SaveButton resource={resource} saved={saved.includes(resource.id)} toggle={toggle} />
          </div>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">Not sure you qualify? It’s okay to call and ask.</p>
        </aside>
      </div>
    </main>
  );
}

function SavedPage({ saved, toggle }: { saved: number[]; toggle: (id: number) => void }) {
  const [location, setLocation] = useState('');
  const params = useMemo(() => location.trim() ? { location: location.trim() } : undefined, [location]);
  const resourcesQuery = useListResources(params, { query: { queryKey: getListResourcesQueryKey(params) } });
  const savedResources = (resourcesQuery.data ?? []).filter(resource => saved.includes(resource.id));
  return (
    <main className="site-shell min-h-[78vh] pb-20 pt-12 sm:pt-16">
      <p className="text-[11px] font-bold uppercase tracking-[.18em] text-accent">Kept close at hand</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="serif text-[39px] font-semibold tracking-[-.035em] sm:text-[48px]">Your saved resources</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Listings you’ve set aside for later. They stay on this device, so you can come back when the time is right.</p></div>
        {saved.length > 0 && <label className="relative block w-full sm:w-[250px]"><span className="sr-only">Filter saved listings by location</span><MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Filter by location" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm" data-testid="input-saved-location" /></label>}
      </div>
      <div className="mt-9">
        {resourcesQuery.isError ? <ErrorState retry={() => void resourcesQuery.refetch()} /> :
          resourcesQuery.isLoading ? <ResourceGrid resources={[]} saved={saved} toggle={toggle} loading /> :
            !saved.length ? <EmptyState title="A place for the useful things" body="Save a listing that feels worth a closer look. It will be waiting here when you need it." action={<Link href="/" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground no-underline" data-testid="link-find-resources">Find local resources <ArrowRight size={15} /></Link>} /> :
              savedResources.length ? <ResourceGrid resources={savedResources} saved={saved} toggle={toggle} /> :
                <EmptyState title="No saved listings in this area" body="Try a broader location, or return to all the resources you have saved." action={location && <button type="button" onClick={() => setLocation('')} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground" data-testid="button-clear-saved-location">Clear location</button>} />}
      </div>
    </main>
  );
}

function NotFoundPage() {
  return <main className="site-shell min-h-[70vh] py-24 text-center"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-accent">Wrong turn?</p><h1 className="serif mt-3 text-4xl font-semibold">We can help you find your way.</h1><p className="mt-3 text-muted-foreground">That page isn’t here, but the local directory is.</p><Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground no-underline">Back to the directory <ArrowRight size={16} /></Link></main>;
}

function Router() {
  const { saved, toggle } = useSavedResources();
  return <div className="min-h-[100dvh]">
    <Header savedCount={saved.length} />
    <Switch>
      <Route path="/"><DirectoryPage saved={saved} toggle={toggle} /></Route>
      <Route path="/saved"><SavedPage saved={saved} toggle={toggle} /></Route>
      <Route path="/resources/:id"><DetailPage saved={saved} toggle={toggle} /></Route>
      <Route><NotFoundPage /></Route>
    </Switch>
    <footer className="border-t border-border bg-[#eae7dc] dark:bg-card/50">
      <div className="site-shell flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="serif text-[15px] font-semibold text-foreground">VillageConnect<span className="text-accent">AI</span></p>
        <p>Good help should be easier to find, wherever you call home.</p>
        <p>Local listings · Made for rural life</p>
      </div>
    </footer>
  </div>;
}

function App() {
  return <QueryClientProvider client={queryClient}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter></QueryClientProvider>;
}

export default App;
