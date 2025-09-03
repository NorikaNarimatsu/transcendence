export const overlayHTML = `
  <div id="overlay" style="display: none;">
    <div id="card">
      <h3 style="margin:0 0 8px 0;">Start a Match</h3>
      <label>Left Player</label>
      <input id="leftInput" placeholder="e.g. Alice" />
      <label>Right Player</label>
      <input id="rightInput" placeholder="e.g. Bob" />
      <button id="startBtn">Play!</button>
      <p style="font-size:12px;opacity:.8;margin-top:8px;">
        Controls: W/S (Left) • ↑/↓ (Right). First to 11 wins.
      </p>
    </div>
  </div>
`;

export const welcomePageHTML = `
  <div id="welcome-page">
    <h1 class="welcome-title">Welcome to...</h1>
    <p class="welcome-subtitle">the best pong game you ever saw!</p>
    <button id="play-game-btn">Let's play</button>
  </div>
`;

export const signupPageHTML = `
  <div id="signup-page" class="page-container">
    <div class="signup-card">
      <div class="signup-left">
        <h1 class="page-title">SIGN UP</h1>
        <div class="email-input-container">
          <input 
            type="email" 
            id="email-input" 
            placeholder="name.00@email.com" 
            class="pixel-input"
          />
          <span class="email-icon">✉</span>
        </div>
        <button id="continue-btn" class="pixel-button">Continue »</button>
      </div>
      <div class="signup-right">
        <!-- The cloud illustration will be done with CSS -->
      </div>
    </div>
  </div>
`;

export const profilePageHTML = `
  <div id="profile-page" class="page-container">
    <h1 class="profile-title">What should we play today?</h1>
    <div class="profile-content">
      <div class="player-info-card">
        <h2>PLAYER INFO</h2>
        <!-- This will be populated later -->
      </div>
      <div class="game-buttons">
        <button id="play-snake-btn" class="game-button">Play snake <span>»</span></button>
        <button id="play-pong-btn" class="game-button">Play pong <span>»</span></button>
      </div>
    </div>
  </div>
`;