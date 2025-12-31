import './AppIcon.css'

// Map of app names to their icon URLs (using macosicons.com or similar)
const APP_ICONS: Record<string, string> = {
  // Browsers
  'Safari': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/3c903e4d22fdc7cc51e7a7bd35849492_Safari.png',
  'Google Chrome': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/35fe0fb6f2d44b21e139d58e9d73c042_Google_Chrome.png',
  'Arc': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/c86f1e30c4f5c5a6f08f9f6e7a94d3d2_Arc.png',
  'Firefox': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/8f3c8b8e8f4f4b9e8f3c8b8e8f4f4b9e_Firefox.png',
  'Zen': 'https://zen-browser.app/logo.svg',

  // System
  'Finder': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/4e7e8f3c8b8e8f4f4b9e8f3c8b8e8f4f_Finder.png',
  'System Settings': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/d4f4b9e8f3c8b8e8f4f4b9e8f3c8b8e_System_Preferences.png',
  'Terminal': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/8f3c8b8e8f4f4b9e8f3c8b8e8f4f4b9e_Terminal.png',

  // Productivity
  'Obsidian': 'https://obsidian.md/images/obsidian-logo-gradient.svg',
  'Notion': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/notion-icon.png',
  'Notes': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/8f3c8b8e8f4f4b9e8f3c8b8e8f4f4b9e_Notes.png',
  'Things': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/things-icon.png',
  'Fantastical': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/fantastical-icon.png',

  // Dev Tools
  'Code': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/vscode-icon.png',
  'Cursor': 'https://cursor.sh/apple-touch-icon.png',
  'Xcode': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/8f3c8b8e8f4f4b9e8f3c8b8e8f4f4b9e_Xcode.png',
  'Ghostty': 'https://ghostty.org/apple-touch-icon.png',

  // Communication
  'Messages': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/8f3c8b8e8f4f4b9e8f3c8b8e8f4f4b9e_Messages.png',
  'Mail': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/8f3c8b8e8f4f4b9e8f3c8b8e8f4f4b9e_Mail.png',
  'Slack': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/slack-icon.png',
  'Discord': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/discord-icon.png',
  'Snapchat': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/snapchat-icon.png',

  // Media
  'Spotify': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/spotify-icon.png',
  'Music': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/8f3c8b8e8f4f4b9e8f3c8b8e8f4f4b9e_Music.png',
  'YouTube: Watch': 'https://www.youtube.com/s/desktop/a7f09974/img/favicon_144x144.png',

  // Creative
  'DaVinci Resolve': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/davinci-icon.png',
  'Final Cut Pro': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/8f3c8b8e8f4f4b9e8f3c8b8e8f4f4b9e_Final_Cut_Pro.png',
  'Lightroom Classic': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/lightroom-icon.png',

  // AI
  'Claude': 'https://claude.ai/favicon.ico',
  'ChatGPT': 'https://chat.openai.com/apple-touch-icon.png',

  // Utilities
  'qBittorrent': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/qbittorrent-icon.png',
  'ForkLift': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/forklift-icon.png',
  'Maps': 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/8f3c8b8e8f4f4b9e8f3c8b8e8f4f4b9e_Maps.png',
  'Instagram': 'https://www.instagram.com/static/images/ico/apple-touch-icon-180x180-precomposed.png/c06fdb2357bd.png',
}

// Generate a consistent color for fallback icons
function getColorForApp(name: string): string {
  const colors = [
    '#58a6ff', '#a371f7', '#39d353', '#f0883e', '#f85149',
    '#db61a2', '#79c0ff', '#d2a8ff', '#56d364', '#ffa657',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

interface AppIconProps {
  name: string
  size?: number
}

export function AppIcon({ name, size = 24 }: AppIconProps) {
  const iconUrl = APP_ICONS[name]

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className="app-icon"
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fallback to letter avatar on error
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          target.nextElementSibling?.classList.remove('hidden')
        }}
      />
    )
  }

  // Fallback: colored circle with first letter
  const initial = name.charAt(0).toUpperCase()
  const color = getColorForApp(name)

  return (
    <div
      className="app-icon-fallback"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.5,
      }}
    >
      {initial}
    </div>
  )
}
