<script lang="ts">
  import idleImg from '../assets/idle.png';
  import focusImg from '../assets/focus.png';
  import angryImg from '../assets/angry.png';
  import lotusImg from '../assets/lotus.png';

  let { revealed = false }: { revealed: boolean } = $props();

  const taunts = [
    'Junior, You Dare!',
    'Kowtow Before Me!',
    'Courting Death?!',
    'I will erase your seven generations!',
  ];

  let squish = $state(false);
  let angry = $state(false);
  let taunt = $state('');
  let squishTimer: ReturnType<typeof setTimeout>;
  let angryTimer: ReturnType<typeof setTimeout>;

  function poke() {
    if (revealed) return;
    clearTimeout(squishTimer);
    clearTimeout(angryTimer);
    angry = true;
    squish = true;
    taunt = taunts[Math.floor(Math.random() * taunts.length)];
    squishTimer = setTimeout(() => { squish = false; }, 400);
    angryTimer = setTimeout(() => { angry = false; taunt = ''; }, 2000);
  }

  function src() {
    if (revealed) return focusImg;
    if (angry) return angryImg;
    return idleImg;
  }
</script>

<div class="cultivator">
  {#if taunt}
    <p class="taunt">{taunt}</p>
  {/if}
  <img
    class="idle"
    class:revealed
    class:squish
    src={src()}
    alt="Cultivator"
    onclick={poke}
    role="button"
    tabindex="0"
  />
  <img class="lotus" class:revealed src={lotusImg} alt="Lotus" />
</div>

<style>
  .cultivator {
    position: relative;
    width: 260px;
    height: 260px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }


  .lotus {
    position: absolute;
    bottom: 0;
    width: 240px;
    transition: transform 0.8s ease-in-out;
    z-index: 1;
  }

  .lotus.revealed {
    transform: translateY(5px);
  }

  .idle {
    position: absolute;
    bottom: 70px;
    width: 320px;
    z-index: 2;
    animation: float 4s ease-in-out infinite;
    transition: bottom 0.8s ease-in-out;
  }

  .idle.revealed {
    bottom: 85px;
    animation: float 4s ease-in-out infinite, vibrate 0.15s ease-in-out infinite;
  }

  .taunt {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.85);
    color: #7a1a1a;
    font-family: 'Georgia', serif;
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
    padding: 0.25rem 0.6rem;
    border-radius: 8px;
    border: 1px solid rgba(180, 60, 60, 0.4);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10;
    animation: taunt-in 0.2s ease-out;
    pointer-events: none;
  }

  .taunt::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(255,255,255,0.85);
    border-bottom: none;
  }

  @keyframes taunt-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .idle:not(.revealed) {
    cursor: pointer;
  }

  .idle.squish {
    animation: squish 0.4s ease-in-out forwards !important;
  }

  @keyframes squish {
    0%   { transform: scaleY(1)    scaleX(1); }
    30%  { transform: scaleY(0.6)  scaleX(1.3); }
    60%  { transform: scaleY(1.15) scaleX(0.9); }
    100% { transform: scaleY(1)    scaleX(1); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }

  @keyframes vibrate {
    0%, 100% { transform: translateY(0) translateX(0); }
    25%       { transform: translateY(-1px) translateX(1px); }
    75%       { transform: translateY(1px) translateX(-1px); }
  }

</style>
