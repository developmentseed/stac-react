---
# These are optional metadata elements. Feel free to remove any of them.
status: "accepted"
date: 2025-09-18
decision-makers: @gadomski @AliceR
---

# Use a fetch library for caching

## Context and Problem Statement

Currently, `stac-react` uses the native `fetch` API for all STAC requests, with no built-in caching or request deduplication. As the library is intended for use in applications that may navigate between many STAC resources, efficient caching and request management are important for performance and developer experience.

## Decision Drivers

- Improve performance by caching repeated requests.
- Reduce network usage and latency.
- Provide a more robust API for request state, error handling, and background updates.
- Align with common React ecosystem practices.

## Considered Options

- Continue using native `fetch` with custom caching logic.
- Use TanStack Query (`@tanstack/react-query`) for fetching and caching.
- Use another fetch/caching library (e.g., SWR, Axios with custom cache).

## Decision Outcome

**Chosen option:** Use TanStack Query (`@tanstack/react-query`).

**Justification:**
TanStack Query is widely adopted, well-documented, and provides robust caching, request deduplication, background refetching, and React integration. It will make `stac-react` more attractive to downstream applications and reduce the need for custom caching logic.

### Consequences

- **Good:** Improved performance and developer experience; less custom code for caching and request state.
- **Bad:** Adds a new dependency and requires refactoring existing hooks to use TanStack Query.

### Confirmation

- Implementation will be confirmed by refactoring hooks to use TanStack Query and verifying caching behavior in tests and example app.
- Code review will ensure correct usage and integration.

## Pros and Cons of the Options

### TanStack Query

- **Good:** Robust caching, request deduplication, background updates, React integration.
- **Good:** Well-supported and documented.
- **Neutral:** Adds a dependency, but it is widely used.
- **Bad:** Requires refactoring and learning curve for maintainers.

### Native Fetch

- **Good:** No new dependencies.
- **Bad:** No built-in caching, more custom code required, less robust for complex scenarios.

### Other Libraries (SWR, Axios)

- **Good:** Some provide caching, but less feature-rich or less adopted for React.
- **Bad:** May require more custom integration.

## More Information

- [TanStack Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview)
- This ADR will be revisited if TanStack Query no longer meets project needs or if a better alternative emerges.
