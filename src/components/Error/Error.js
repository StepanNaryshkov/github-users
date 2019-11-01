import React from "react";

export function Error() {
  return (
    <button
      className="error">
  <span className="error__text">
    <svg className="error__icon" viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52
        2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
    &nbsp;&nbsp;
  </span>
      <svg
        className="error__icon"
        viewBox="0 0 24 24"
        width="20"
        height="20">
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41
      19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  )
}
