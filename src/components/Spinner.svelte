<style>
  .root {
    color: rgb(220, 0, 78);
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
  }
  .circle {
    animation: circular-dash 1s ease-in-out infinite;
    stroke-dasharray: 80px, 200px;
    stroke-dashoffset: 0;
    stroke: currentColor;
  }

  @keyframes circular-dash {
    0% {
      stroke-dasharray: 1px, 200px;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 100px, 200px;
      stroke-dashoffset: -15px;
    }
    100% {
      stroke-dasharray: 100px, 200px;
      stroke-dashoffset: -125px;
    }
  }
</style>

<div class="root">
  <svg viewBox="22 22 44 44" width="40" height="40">
    <circle
      class="circle"
      cx="44"
      cy="44"
      r="20.2"
      fill="none"
      stroke-width="3.6" />
  </svg>
</div>
