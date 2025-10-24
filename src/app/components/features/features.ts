import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  imports: [
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './features.html',
  styleUrl: './features.scss'
})
export class Features {
  features: Feature[] = [
    {
      icon: 'cloud',
      title: 'Multi-Cloud Support',
      description: 'Connect to multiple cloud storage providers including Google Drive, Dropbox, OneDrive, S3, and many more.'
    },
    {
      icon: 'security',
      title: 'Secure & Encrypted',
      description: 'Your data is protected with industry-standard encryption. All transfers are secure and your credentials are safely stored.'
    },
    {
      icon: 'speed',
      title: 'Fast & Efficient',
      description: 'Optimized for speed with multi-threaded transfers and intelligent caching for the best performance.'
    },
    {
      icon: 'sync',
      title: 'Automated Sync',
      description: 'Set up automatic synchronization between your local files and cloud storage with flexible scheduling options.'
    },
    {
      icon: 'dashboard',
      title: 'Intuitive Interface',
      description: 'User-friendly desktop application with a clean, modern interface that makes cloud management simple.'
    },
    {
      icon: 'code',
      title: 'Open Source',
      description: 'Built with transparency in mind. Inspect the code, contribute, and customize it to your needs.'
    }
  ];
}
