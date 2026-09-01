import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDED_KEY = "matchday-onboarded";

/**
 * Module-level store for the onboarding flag, read via useSyncExternalStore.
 *
 * AuthGate previously kept its own useState seeded once at mount. That left a
 * gap: an already-mounted AuthGate instance never re-read the flag after
 * markOnboarded() changed it elsewhere, so it kept redirecting on stale data
 * until something forced a remount. useSyncExternalStore subscribes every
 * instance directly to this store, so a change is visible everywhere the
 * instant it happens, mount or no mount.
 */
let cached: boolean | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeOnboarded(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOnboardedSnapshot(): boolean | null {
  return cached;
}

let loadPromise: Promise<void> | null = null;

function load() {
  if (cached !== null || loadPromise) return loadPromise;
  loadPromise = AsyncStorage.getItem(ONBOARDED_KEY)
    .then((value) => {
      cached = value === "true";
      emit();
    })
    .catch(() => {
      cached = true;
      emit();
    });
  return loadPromise;
}

// Kick off the read once, at module init, rather than per-component-mount.
void load();

/** Marks the intro as seen so it never shows again on this device. */
export async function markOnboarded(): Promise<void> {
  cached = true;
  emit();
  await AsyncStorage.setItem(ONBOARDED_KEY, "true");
}

/** Dev/testing affordance: clears the flag so the intro shows again. */
export async function resetOnboarding(): Promise<void> {
  cached = false;
  emit();
  await AsyncStorage.removeItem(ONBOARDED_KEY);
}
