export interface State {
  shuffled: number[];
  pointer: number;
  cycles: number;
  revealed: boolean;
  batchSize: number;
  ignoreEasy: boolean;
}

export async function loadState(): Promise<State> {
  const s = await chrome.storage.sync.get(['shuffled', 'pointer', 'cycles', 'revealed', 'batchSize', 'ignoreEasy']);
  return {
    shuffled: s.shuffled ?? [],
    pointer: s.pointer ?? 0,
    cycles: s.cycles ?? 0,
    revealed: s.revealed ?? false,
    batchSize: s.batchSize ?? 3,
    ignoreEasy: s.ignoreEasy ?? false,
  };
}

export async function saveState(state: State): Promise<void> {
  await chrome.storage.sync.set(state);
}
