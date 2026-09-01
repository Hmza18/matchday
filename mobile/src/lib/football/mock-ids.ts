/** Bundled demo rows are prefixed so they can never be mistaken for API event ids. */
export function isMockFixtureId(id: string) {
  return id.startsWith("mock-");
}
