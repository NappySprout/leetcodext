export interface State {
  shuffled: number[];
  pointer: number;
  cycles: number;
  revealed: boolean;
}

export async function loadState(): Promise<State> {
  const s = await chrome.storage.local.get(['shuffled', 'pointer', 'cycles', 'revealed']);
  return {
    shuffled: s.shuffled ?? [],
    pointer: s.pointer ?? 0,
    cycles: s.cycles ?? 0,
    revealed: s.revealed ?? false,
  };
}

export async function saveState(state: State): Promise<void> {
  await chrome.storage.local.set(state);
}
