<script>
  import { error } from '../store/app';
</script>

<button class="wrap" class:error={$error} on:click={() => error.set('')}>
    <span class="text">
      <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
      </svg>
        &nbsp;&nbsp;{$error}
    </span>
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
  </svg>
</button>

<style>
  .wrap {
    border: none;
    padding: 10px;
    position: absolute;
    left: 20px;
    bottom: 20px;
    width: 280px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #d32f2f;
    box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12);
    cursor: pointer;
    transform: translateX(-300px);
    opacity: 0;
    transition: all 0.2s;
  }
  .error {
    transform: translateX(0);
    opacity: 1;
  }
  .icon {
    fill: #fff;
    min-width: 20px;
  }
  .close {
    background-color: transparent;
    border: none;
    margin: 0;
    padding: 0;
  }
  .text {
    font-size: 0.875rem;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    line-height: 1.43;
    letter-spacing: 0.01em;
    display: flex;
    color: #fff;
    text-align: left;
  }
</style>
