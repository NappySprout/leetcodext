<script lang="ts">
  import { onMount } from 'svelte';
  import questions from '../../lib/questions.json';
  import { loadState, saveState } from '../../lib/store';
  import Cultivator from '../../lib/Cultivator.svelte';

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
  let enlightened = $state(false);

  const activeTotal = $derived(ignoreEasy ? questions.length - easyIds.size : questions.length);
  const batch = $derived(
    shuffled.slice(pointer).filter((id) => !ignoreEasy || !easyIds.has(id)).slice(0, batchSize)
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
    let remaining = batch.length;
    let next = pointer;
    while (remaining > 0 && next < shuffled.length) {
      if (!ignoreEasy || !easyIds.has(shuffled[next])) remaining--;
      next++;
    }
    while (ignoreEasy && next < shuffled.length && easyIds.has(shuffled[next])) next++;

    if (next >= shuffled.length) {
      cycles += 1;
      pointer = 0;
      shuffled = shuffle(questions.map((q) => q.id));
    } else {
      pointer = next;
    }
    revealed = false;
    enlightened = true;
    await saveState({ shuffled: [...shuffled], pointer, cycles, revealed: false, batchSize, ignoreEasy });
    setTimeout(() => { enlightened = false; }, 3000);
  }
</script>

<main class:revealed>
  {#if enlightened}
    <div class="enlightened-overlay">
      <span>成功</span>
    </div>
  {/if}
  <h1 class="title">Algorithm Ascension</h1>
  <p class="subtitle">Cultivation Center</p>

  <Cultivator {revealed} />

  <p class="rank">Core Formation Rank {cycles}</p>
  <p class="qi">{doneSoFar} / {activeTotal} Qi</p>

  {#if !revealed}
    <button class="cultivate" onclick={() => setRevealed(true)}>CULTIVATE</button>
  {:else}
    <ul>
      {#each batch as id}
        <li>
          <a href={byId[id].url} target="_blank" rel="noreferrer">{byId[id].title}</a>
        </li>
      {/each}
    </ul>
    <div class="actions">
      <button class="secondary" onclick={() => setRevealed(false)}>Retreat</button>
      <button class="cultivate" onclick={finish}>Ascend</button>
    </div>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem 1.5rem 1.5rem;
    width: 280px;
    background:
      radial-gradient(ellipse at 50% 200px, #e8f4ff 0%, transparent 55%),
      radial-gradient(ellipse at 80% 220px, #c8e8f8 0%, transparent 40%),
      radial-gradient(ellipse at 20% 220px, #d4eaf7 0%, transparent 40%),
      linear-gradient(180deg, #a8d4f0 0%, #6aaee8 50%, #4a8bc4 100%);
    color: #1a2a3a;
    font-family: 'Georgia', serif;
  }

  .title {
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #2c4a6e;
    margin: 0;
    text-align: center;
    text-shadow: 0 1px 3px rgba(255,255,255,0.5);
  }

  .subtitle {
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #3a6a8a;
    margin: 0;
  }

  .rank {
    font-size: 0.85rem;
    color: #2c4a6e;
    margin: 0.25rem 0 0;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .qi {
    font-size: 0.8rem;
    color: #3a6a8a;
    margin: 0;
  }

  button.cultivate {
    width: 100%;
    padding: 0.65rem;
    margin-top: 0.5rem;
    background: rgba(44, 74, 110, 0.75);
    color: #e8f4ff;
    font-family: 'Georgia', serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 6px;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: background 0.2s;
  }

  button.cultivate:hover {
    background: rgba(44, 74, 110, 0.9);
  }

  button.secondary {
    flex: 1;
    padding: 0.6rem;
    margin-top: 0.5rem;
    background: rgba(255,255,255,0.25);
    color: #2c4a6e;
    font-family: 'Georgia', serif;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 6px;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: background 0.2s;
  }

  button.secondary:hover {
    background: rgba(255,255,255,0.4);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  .actions .cultivate {
    flex: 2;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0.25rem 0 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  li a {
    display: block;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    background: rgba(255,255,255,0.35);
    border: 1px solid rgba(255,255,255,0.5);
    color: #1a3a5c;
    text-decoration: none;
    font-size: 0.82rem;
    font-family: 'Georgia', serif;
    backdrop-filter: blur(4px);
    transition: background 0.2s, color 0.2s;
  }

  li a:hover {
    background: rgba(255,255,255,0.55);
    color: #0d1f33;
  }

  .enlightened-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 100;
    animation: enlighten 3s ease-in-out forwards;
  }

  .enlightened-overlay span {
    font-family: 'Georgia', serif;
    font-size: 3.5rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: #c9a84c;
    -webkit-text-stroke: 2px rgba(120, 60, 0, 0.8);
    text-shadow:
      0 0 20px rgba(255, 220, 80, 0.9),
      0 0 40px rgba(255, 200, 40, 0.6),
      0 0 60px rgba(255, 180, 0, 0.4),
      0 2px 6px rgba(0, 0, 0, 0.9),
      0 4px 12px rgba(0, 0, 0, 0.7);
  }

  @keyframes enlighten {
    0%   { opacity: 0; }
    20%  { opacity: 1; }
    70%  { opacity: 1; }
    100% { opacity: 0; }
  }

  main {
    position: relative;
    overflow: hidden;
  }

  /* small tight glow */
  main::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 130px 130px at 50% 200px, rgba(255, 230, 80, 0.55) 0%, transparent 100%);
    opacity: 0;
  }

  /* large soft halo */
  main::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 240px 240px at 50% 200px, rgba(255, 220, 60, 0.2) 0%, transparent 100%);
    opacity: 0;
  }

  main.revealed::before {
    animation: glow-inner 3s ease-in-out infinite;
  }

  main.revealed::after {
    animation: glow-outer 3s ease-in-out infinite reverse;
  }

  @keyframes glow-inner {
    0%, 100% { opacity: 0.9; }
    50%       { opacity: 0.3; }
  }

  @keyframes glow-outer {
    0%, 100% { opacity: 0.9; }
    50%       { opacity: 0.3; }
  }
</style>
