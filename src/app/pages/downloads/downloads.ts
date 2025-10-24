import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

interface DownloadPlatform {
  name: string;
  icon: string;
  description: string;
  downloads: DownloadOption[];
}

interface DownloadOption {
  name: string;
  architecture: string;
  size: string;
  url: string;
}

interface ChangelogVersion {
  version: string;
  date: string;
  changes: {
    added?: string[];
    changed?: string[];
    fixed?: string[];
    warning?: string[];
  };
  isLatest?: boolean;
}

// GitHub API Interfaces
interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  assets: GitHubAsset[];
  body: string;
  prerelease: boolean;
  html_url: string;
}

interface GitHubAsset {
  name: string;
  size: number;
  browser_download_url: string;
}

@Component({
  selector: 'app-downloads',
  imports: [
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './downloads.html',
  styleUrl: './downloads.scss'
})
export class Downloads implements OnInit {
  platforms: DownloadPlatform[] = [];
  changelog: ChangelogVersion[] = [];
  isLoading = true;
  error: string | null = null;
  latestRelease: GitHubRelease | null = null;

  private readonly GITHUB_API_BASE = 'https://api.github.com/repos/Zarestia-Dev/rclone-manager';
  private readonly CHANGELOG_URL = 'https://raw.githubusercontent.com/Zarestia-Dev/rclone-manager/master/CHANGELOG.md';

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData(retryCount = 0): Promise<void> {
    const maxRetries = 2;
    
    try {
      this.isLoading = true;
      this.error = null;
      
      await Promise.all([
        this.fetchReleases(),
        this.fetchChangelog()
      ]);
      
      this.isLoading = false;
      
      // Log successful load for debugging
      console.log('Successfully loaded release data:', {
        platforms: this.platforms.length,
        changelog: this.changelog.length,
        latestRelease: this.latestRelease?.tag_name
      });
      
    } catch (error) {
      console.error(`Error loading data (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        // Retry after a short delay
        console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => this.loadData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      // Final failure - show fallback
      this.error = 'Unable to load the latest release information from GitHub. Please visit our GitHub page for downloads.';
      this.isLoading = false;
      this.loadFallbackData();
    }
  }

  private async fetchReleases(): Promise<void> {
    const releases = await firstValueFrom(
      this.http.get<GitHubRelease[]>(`${this.GITHUB_API_BASE}/releases`)
    );

    if (releases.length > 0) {
      this.latestRelease = releases[0];
      this.platforms = this.generatePlatformsFromReleases(releases);
    }
  }

  private async fetchChangelog(): Promise<void> {
    const changelogText = await firstValueFrom(
      this.http.get(this.CHANGELOG_URL, { responseType: 'text' })
    );
    
    this.changelog = this.parseChangelog(changelogText);
  }

  private generatePlatformsFromReleases(releases: GitHubRelease[]): DownloadPlatform[] {
    const latestRelease = releases[0];
    if (!latestRelease || !latestRelease.assets) return [];

    const platforms: DownloadPlatform[] = [
      {
        name: 'Windows',
        icon: 'computer',
        description: 'For Windows 10/11 (x64 and ARM64)',
        downloads: []
      },
      {
        name: 'macOS',
        icon: 'laptop_mac',
        description: 'For macOS 10.15+ (Intel and Apple Silicon)',
        downloads: []
      },
      {
        name: 'Linux',
        icon: 'memory',
        description: 'For Linux distributions (x64 and ARM64)',
        downloads: []
      }
    ];

    // Process assets and categorize by platform based on your naming convention
    latestRelease.assets.forEach(asset => {
      const downloadOption = this.createDownloadOption(asset);
      if (!downloadOption) return;

      const name = asset.name.toLowerCase();

      // Windows files: .msi, -setup.exe
      if (name.includes('.msi') || name.includes('-setup.exe')) {
        platforms[0].downloads.push(downloadOption);
      } 
      // macOS files: .dmg, .app.tar.gz
      else if (name.includes('.dmg') || name.includes('.app.tar.gz')) {
        platforms[1].downloads.push(downloadOption);
      } 
      // Linux files: .appimage, .deb, .rpm
      else if (name.includes('.appimage') || name.includes('.deb') || name.includes('.rpm')) {
        platforms[2].downloads.push(downloadOption);
      }
    });

    // Sort downloads within each platform (MSI before EXE, etc.)
    platforms.forEach(platform => {
      platform.downloads.sort((a, b) => {
        // Prioritize certain file types
        const typeOrder = ['MSI Installer', 'EXE Installer', 'DMG Installer', 'macOS App Bundle', 'AppImage', 'DEB Package', 'RPM Package'];
        const aType = a.name.includes('MSI') ? 'MSI Installer' : 
                     a.name.includes('Setup') ? 'EXE Installer' :
                     a.name.includes('DMG') ? 'DMG Installer' :
                     a.name.includes('App Bundle') ? 'macOS App Bundle' :
                     a.name.includes('AppImage') ? 'AppImage' :
                     a.name.includes('Debian') ? 'DEB Package' : 'RPM Package';
        
        const bType = b.name.includes('MSI') ? 'MSI Installer' : 
                     b.name.includes('Setup') ? 'EXE Installer' :
                     b.name.includes('DMG') ? 'DMG Installer' :
                     b.name.includes('App Bundle') ? 'macOS App Bundle' :
                     b.name.includes('AppImage') ? 'AppImage' :
                     b.name.includes('Debian') ? 'DEB Package' : 'RPM Package';

        const aIndex = typeOrder.indexOf(aType);
        const bIndex = typeOrder.indexOf(bType);
        
        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }
        
        // Then sort by architecture (x64 first)
        if (a.architecture === 'x64' && b.architecture === 'ARM64') return -1;
        if (a.architecture === 'ARM64' && b.architecture === 'x64') return 1;
        
        return 0;
      });
    });

    // Filter out platforms with no downloads
    return platforms.filter(platform => platform.downloads.length > 0);
  }

  private createDownloadOption(asset: GitHubAsset): DownloadOption | null {
    const name = asset.name.toLowerCase();
    
    // Skip signature files and source code
    if (name.includes('.sig') || name.includes('source code') || name === 'latest.json') {
      return null;
    }

    // Extract architecture
    let architecture = 'Unknown';
    if (name.includes('x64') || name.includes('amd64') || name.includes('x86_64')) {
      architecture = 'x64';
    } else if (name.includes('arm64') || name.includes('aarch64')) {
      architecture = 'ARM64';
    } else if (name.includes('universal')) {
      architecture = 'Universal';
    }

    // Determine file type and display name
    let fileType = 'Download';
    let displayName = asset.name;

    if (name.includes('.msi')) {
      fileType = 'MSI Installer';
      displayName = `Windows MSI (${architecture})`;
    } else if (name.includes('-setup.exe')) {
      fileType = 'EXE Installer';
      displayName = `Windows Setup (${architecture})`;
    } else if (name.includes('.dmg')) {
      fileType = 'DMG Installer';
      displayName = `macOS DMG (${architecture})`;
    } else if (name.includes('.app.tar.gz')) {
      fileType = 'macOS App Bundle';
      displayName = `macOS App Bundle (${architecture})`;
    } else if (name.includes('.appimage')) {
      fileType = 'AppImage';
      displayName = `Linux AppImage (${architecture})`;
    } else if (name.includes('.deb')) {
      fileType = 'DEB Package';
      displayName = `Debian Package (${architecture})`;
    } else if (name.includes('.rpm')) {
      fileType = 'RPM Package';
      displayName = `RPM Package (${architecture})`;
    } else {
      // Skip unknown file types
      return null;
    }

    // Format file size
    const sizeInMB = (asset.size / (1024 * 1024)).toFixed(1);
    const size = `${sizeInMB} MB`;

    return {
      name: displayName,
      architecture,
      size,
      url: asset.browser_download_url
    };
  }

  private parseChangelog(changelogText: string): ChangelogVersion[] {
    const changelog: ChangelogVersion[] = [];
    const lines = changelogText.split('\n');
    let currentVersion: ChangelogVersion | null = null;
    let currentSection: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match version headers like "## [0.1.3] - 2025-09-30"
      const versionMatch = line.match(/^##\s*\[(.+?)\]\s*-\s*(.+)$/);
      if (versionMatch) {
        if (currentVersion) {
          changelog.push(currentVersion);
        }

        currentVersion = {
          version: versionMatch[1],
          date: versionMatch[2],
          changes: {},
          isLatest: changelog.length === 0 // First version is latest
        };
        currentSection = null;
        continue;
      }

      if (!currentVersion) continue;

      // Match section headers like "### Added", "### Changed", etc.
      const sectionMatch = line.match(/^###\s*(.+)$/);
      if (sectionMatch) {
        const section = sectionMatch[1].toLowerCase();
        if (['added', 'changed', 'fixed', 'warning'].includes(section)) {
          currentSection = section;
          if (!currentVersion.changes[section as keyof typeof currentVersion.changes]) {
            currentVersion.changes[section as keyof typeof currentVersion.changes] = [];
          }
        }
        continue;
      }

      // Match bullet points
      if (currentSection && line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const content = line.replace(/^[•\-*]\s*/, '').trim();
        if (content) {
          const sectionArray = currentVersion.changes[currentSection as keyof typeof currentVersion.changes];
          if (Array.isArray(sectionArray)) {
            sectionArray.push(content);
          }
        }
      }
    }

    // Add the last version
    if (currentVersion) {
      changelog.push(currentVersion);
    }

    return changelog;
  }

  private loadFallbackData(): void {
    // Minimal fallback data that directs users to GitHub - no hardcoded versions
    this.platforms = [
      {
        name: 'Windows',
        icon: 'computer',
        description: 'For Windows 10/11 (x64 and ARM64)',
        downloads: [
          {
            name: 'Download for Windows',
            architecture: 'All',
            size: 'Various',
            url: 'https://github.com/Zarestia-Dev/rclone-manager/releases/latest'
          }
        ]
      },
      {
        name: 'macOS',
        icon: 'laptop_mac',
        description: 'For macOS 10.15+ (Intel and Apple Silicon)',
        downloads: [
          {
            name: 'Download for macOS',
            architecture: 'All',
            size: 'Various',
            url: 'https://github.com/Zarestia-Dev/rclone-manager/releases/latest'
          }
        ]
      },
      {
        name: 'Linux',
        icon: 'memory',
        description: 'For Linux distributions (x64 and ARM64)',
        downloads: [
          {
            name: 'Download for Linux',
            architecture: 'All',
            size: 'Various',
            url: 'https://github.com/Zarestia-Dev/rclone-manager/releases/latest'
          }
        ]
      }
    ];

    this.changelog = [
      {
        version: 'Unable to Load',
        date: 'Please visit GitHub',
        isLatest: true,
        changes: {
          added: [
            'GitHub API temporarily unavailable',
            'Please visit the GitHub releases page for the latest information',
            'All release data is normally fetched dynamically from GitHub'
          ]
        }
      }
    ];

    // Set a generic latest release for the fallback
    this.latestRelease = {
      tag_name: 'latest',
      name: 'Latest Release',
      published_at: new Date().toISOString(),
      assets: [],
      body: 'Please visit GitHub for release notes',
      prerelease: false,
      html_url: 'https://github.com/Zarestia-Dev/rclone-manager/releases/latest'
    };
  }

  downloadFile(url: string): void {
    window.open(url, '_blank');
  }

  openExternalLink(url: string): void {
    window.open(url, '_blank');
  }

  getAssetCount(): number {
    if (!this.latestRelease || !this.latestRelease.assets) return 0;
    // Count only main download files (excluding signatures and source)
    return this.latestRelease.assets.filter(asset => 
      !asset.name.toLowerCase().includes('.sig') && 
      !asset.name.toLowerCase().includes('source code') && 
      asset.name !== 'latest.json'
    ).length;
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
      }
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
  }

  // Method to refresh data manually
  async refreshData(): Promise<void> {
    await this.loadData();
  }

  // Debug method to check what data is being loaded
  getDebugInfo(): any {
    return {
      isLoading: this.isLoading,
      hasError: !!this.error,
      platformCount: this.platforms.length,
      changelogCount: this.changelog.length,
      latestReleaseTag: this.latestRelease?.tag_name,
      latestReleaseAssets: this.latestRelease?.assets?.length || 0,
      apiUrls: {
        releases: `${this.GITHUB_API_BASE}/releases`,
        changelog: this.CHANGELOG_URL
      }
    };
  }
}
