import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

interface DocSection {
  title: string;
  icon: string;
  description: string;
  items: DocItem[];
}

interface DocItem {
  title: string;
  description?: string;
  url: string;
  isExternal?: boolean;
}

@Component({
  selector: 'app-docs',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './docs.html',
  styleUrl: './docs.scss'
})
export class Docs {
  constructor(private router: Router) {}

  docSections: DocSection[] = [
    {
      title: 'Getting Started',
      icon: 'rocket_launch',
      description: 'Everything you need to get up and running',
      items: [
        {
          title: 'Installation',
          description: 'How to install RClone Manager on your system',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Installation',
          isExternal: true
        },
        {
          title: 'Configuration',
          description: 'Initial setup and linking your rclone remotes',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Configuration',
          isExternal: true
        },
        {
          title: 'Building from Source',
          description: 'Instructions for developers and packagers',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Building',
          isExternal: true
        }
      ]
    },
    {
      title: 'User Guide',
      icon: 'menu_book',
      description: 'Learn how to use RClone Manager effectively',
      items: [
        {
          title: 'Usage Guide',
          description: 'Learn how to manage remotes, run sync/copy jobs, and more',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Usage',
          isExternal: true
        },
        {
          title: 'Tips & Tricks',
          description: 'Advanced techniques and best practices',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Tips-and-Tricks',
          isExternal: true
        },
        {
          title: 'Integrations',
          description: 'How to integrate with other tools and services',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Integrations',
          isExternal: true
        }
      ]
    },
    {
      title: 'Platform Specific',
      icon: 'computer',
      description: 'Platform-specific installation and troubleshooting',
      items: [
        {
          title: 'Windows Installation',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Installation-Windows',
          isExternal: true
        },
        {
          title: 'macOS Installation',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Installation-macOS',
          isExternal: true
        },
        {
          title: 'Linux Installation',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Installation-Linux',
          isExternal: true
        }
      ]
    },
    {
      title: 'Support',
      icon: 'help',
      description: 'Get help when you need it',
      items: [
        {
          title: 'Troubleshooting',
          description: 'Fix common problems across platforms',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Troubleshooting',
          isExternal: true
        },
        {
          title: 'FAQ',
          description: 'Frequently asked questions',
          url: '/faq'
        },
        {
          title: 'GitHub Discussions',
          description: 'Community support and discussions',
          url: 'https://github.com/RClone-Manager/rclone-manager/discussions',
          isExternal: true
        }
      ]
    },
    {
      title: 'Development',
      icon: 'code',
      description: 'Resources for contributors and developers',
      items: [
        {
          title: 'Contributing',
          description: 'How to get involved with development',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/Contributing',
          isExternal: true
        },
        {
          title: 'License',
          description: 'Open-source licensing details',
          url: 'https://github.com/RClone-Manager/rclone-manager/wiki/License',
          isExternal: true
        },
        {
          title: 'GitHub Repository',
          url: 'https://github.com/RClone-Manager/rclone-manager',
          isExternal: true
        }
      ]
    }
  ];



  openLink(item: DocItem): void {
    if (item.isExternal) {
      window.open(item.url, '_blank');
    } else {
      // Internal navigation using Angular Router
      this.router.navigate([item.url]);
    }
  }

  openExternalLink(url: string): void {
    window.open(url, '_blank');
  }
}
