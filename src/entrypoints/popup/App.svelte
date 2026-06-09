<script lang="ts">
  import { onMount } from 'svelte';
  import questions from '../../lib/questions.json';
  import { loadState, saveState } from '../../lib/store';

  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  const easyIds = new Set(questions.filter((q) => q.difficulty === 'easy').map((q) => q.id));

  function shuffle(ids: number[]): number[] {
    const arr = [...ids];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let revealed = $state(false);
  let shuffled = $state<number[]>([]);
  let pointer = $state(0);
  let cycles = $state(0);
  let batchSize = $state(3);
  let ignoreEasy = $state(false);

  const activeTotal = $derived(ignoreEasy ? questions.length - easyIds.size : questions.length);

  const batch = $derived(
    shuffled
      .slice(pointer)
      .filter((id) => !ignoreEasy || !easyIds.has(id))
      .slice(0, batchSize)
  );

  const doneSoFar = $derived(
    shuffled.slice(0, pointer).filter((id) => !ignoreEasy || !easyIds.has(id)).length
  );

  onMount(async () => {
    const s = await loadState();
    cycles = s.cycles;
    pointer = s.pointer;
    revealed = s.revealed;
    batchSize = s.batchSize;
    ignoreEasy = s.ignoreEasy;
    shuffled = s.shuffled.length > 0
      ? s.shuffled
      : shuffle(questions.map((q) => q.id));
    if (s.shuffled.length === 0) {
      await saveState({ shuffled: [...shuffled], pointer, cycles, revealed, batchSize, ignoreEasy });
    }
  });

  async function setRevealed(value: boolean) {
    revealed = value;
    await saveState({ shuffled: [...shuffled], pointer, cycles, revealed: value, batchSize, ignoreEasy });
  }

  async function finish() {
    // advance pointer past the batch, skipping easy questions if needed
    let remaining = batch.length;
    let next = pointer;
    while (remaining > 0 && next < shuffled.length) {
      if (!ignoreEasy || !easyIds.has(shuffled[next])) remaining--;
      next++;
    }
    // also skip any trailing easy questions at the new pointer position
    while (ignoreEasy && next < shuffled.length && easyIds.has(shuffled[next])) next++;

    if (next >= shuffled.length) {
      cycles += 1;
      pointer = 0;
      shuffled = shuffle(questions.map((q) => q.id));
    } else {
      pointer = next;
    }
    revealed = false;
    await saveState({ shuffled: [...shuffled], pointer, cycles, revealed: false, batchSize, ignoreEasy });
  }
</script>

<main>
  {#if !revealed}
    <p class="progress">{doneSoFar} / {activeTotal} done &middot; {cycles} cycles</p>
    <button onclick={() => setRevealed(true)}>Get {batchSize} Questions</button>
  {:else}
    <ul>
      {#each batch as id}
        <li>
          <a href={byId[id].url} target="_blank" rel="noreferrer">{byId[id].title}</a>
        </li>
      {/each}
    </ul>
    <div class="actions">
      <button onclick={() => setRevealed(false)}>Back</button>
      <button onclick={finish}>Finish</button>
    </div>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    min-width: 280px;
  }

  .progress {
    font-size: 0.85rem;
    color: #888;
    margin: 0;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  li a {
    display: block;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    background-color: #1a1a1a;
    color: #646cff;
    text-decoration: none;
    font-size: 0.9rem;
  }

  li a:hover {
    background-color: #2a2a2a;
    color: #535bf2;
  }

  @media (prefers-color-scheme: light) {
    li a {
      background-color: #f3f3f3;
    }
    li a:hover {
      background-color: #e8e8e8;
    }
  }
</style>
