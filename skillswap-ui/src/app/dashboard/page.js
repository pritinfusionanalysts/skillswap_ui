import styles from "./dashboard.module.css";

export default function DiscoveryPage() {
  return (
    <div className={styles.container}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Skill<span>Swap</span></div>
        <nav>
          <ul>
            <li className={styles.active}>Explore Users</li>
            <li>My Requests</li>
            <li>Messages</li>
            <li>My Profile</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Find a Collaborator</h1>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search skills (e.g. React, UI Design)..." />
          </div>
        </header>

        {/* User Grid */}
        <div className={styles.userGrid}>
          {[1, 2, 3, 4, 5, 6].map((user) => (
            <div key={user} className={styles.userCard}>
              <div className={styles.profileHeader}>
                <img src="/placeholder-avatar.png" alt="User" />
                <div className={styles.userInfo}>
                  <h3>John Doe</h3>
                  <p>Full Stack Developer</p>
                </div>
              </div>
              <div className={styles.skills}>
                <span>React</span>
                <span>Node.js</span>
                <span>Figma</span>
              </div>
              <button className={styles.connectBtn}>Send Request</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}