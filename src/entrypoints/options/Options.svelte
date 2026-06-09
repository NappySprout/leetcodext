<script lang="ts">
  import { onMount } from 'svelte';
  import questions from '../../lib/questions.json';
  import { loadState, saveState } from '../../lib/store';

  let batchSize = $state(3);
  let ignoreEasy = $state(false);
  let shuffled = $state<number[]>([]);
  let pointer = $state(0);
  let saved = $state(false);

  onMount(async () => {
    const s = await loadState();
    batchSize = s.batchSize;
    ignoreEasy = s.ignoreEasy;
    shuffled = s.shuffled;
    pointer = s.pointer;
  });

  async function save() {
    const s = await loadState();
    await saveState({ ...s, batchSize, ignoreEasy });
    saved = true;
    setTimeout(() => (saved = false), 1500);
  }

  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
</script>

<main>
  <h2>Settings</h2>

  <div class="settings">
    <label>
      Batch size
      <input type="number" min="1" max="10" bind:value={batchSize} />
    </label>
    <label class="toggle">
      <input type="checkbox" bind:checked={ignoreEasy} />
      Ignore easy questions
    </label>
  </div>
  <button onclick={save}>{saved ? 'Saved!' : 'Save'}</button>

  <h2>Progress</h2>
  <ul>
    {#each shuffled as id, i}
      {@const q = byId[id]}
      {#if q}
        <li class:done={i < pointer} class:hidden={ignoreEasy && q.difficulty === 'easy'}>
          <span class="index">{q.id}.</span>
          <a href={q.url} target="_blank" rel="noreferrer">{q.title}</a>
          <span class="diff {q.difficulty}">{q.difficulty[0].toUpperCase()}</span>
          {#if i < pointer}<span class="check">✓</span>{/if}
        </li>
      {/if}
    {/each}
  </ul>
</main>

<style>
  main {
    max-width: 560px;
    margin: 2rem auto;
    padding: 0 1rem;
    font-family: inherit;
  }

  h2 {
    font-size: 1rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem;
  }

  .settings {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
  }

  input[type='number'] {
    width: 4rem;
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    border: 1px solid #444;
    background: #1a1a1a;
    color: inherit;
    font-size: 0.9rem;
    text-align: center;
  }

  button {
    margin-top: 0.75rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    opacity: 0.4;
  }

  li.done { opacity: 1; }
  li.hidden { display: none; }

  .index {
    color: #888;
    min-width: 2rem;
    text-align: right;
    flex-shrink: 0;
  }

  a {
    color: #646cff;
    text-decoration: none;
    flex: 1;
  }

  a:hover { text-decoration: underline; }

  .diff {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .diff.easy { background: #1a3a1a; color: #4caf50; }
  .diff.medium { background: #3a2a0a; color: #ff9800; }
  .diff.hard { background: #3a1a1a; color: #f44336; }

  .check {
    color: #4caf50;
    flex-shrink: 0;
  }

  @media (prefers-color-scheme: light) {
    input[type='number'] {
      background: #f9f9f9;
      border-color: #ccc;
    }
    .diff.easy { background: #e8f5e9; color: #2e7d32; }
    .diff.medium { background: #fff3e0; color: #e65100; }
    .diff.hard { background: #fce4ec; color: #c62828; }
  }
</style>
