export interface Project {
  slug: string
  title: string
  description: string
  longDescription: string
  tags: string[]
  category: string
  github?: string
  demo?: string
  image?: string
  featured: boolean
  date: string
}

export const projects: Project[] = [
  {
    slug: 'ert-detr',
    title: 'ERT-DETR',
    description: 'Event-based Real-Time Detection Transformer for event camera object detection.',
    longDescription: `
Event-based Real-Time Detection Transformer project for object detection using event cameras.

## Overview
Research project focusing on efficient object detection using event camera data with transformer-based architecture.

## Repository
GitHub: https://github.com/snwfld00/ERT-DETR
    `,
    tags: ['Event Camera', 'Object Detection', 'Transformer', 'PyTorch'],
    category: 'Object Detection',
    github: 'https://github.com/snwfld00/ERT-DETR',
    featured: true,
    date: '2025-01-01',
  },
  {
    slug: 'dfcc-choihong04',
    title: 'DFCC_choihong04',
    description: 'Deep Learning project for financial data analysis and classification.',
    longDescription: `
Deep Learning project for financial data classification and analysis.

## Overview
Research project on applying deep learning techniques to financial data.

## Repository
GitHub: https://github.com/snwfld00/DFCC_choihong04
    `,
    tags: ['Deep Learning', 'Finance', 'Classification'],
    category: 'Deep Learning',
    github: 'https://github.com/snwfld00/DFCC_choihong04',
    featured: true,
    date: '2024-10-01',
  },
  {
    slug: '2024-luckython',
    title: '2024 Luckython',
    description: 'Hackathon project that won Special Award at 1st Luckython, INU College of Information Technology.',
    longDescription: `
Award-winning hackathon project from the 1st Luckython at Incheon National University.

## Award
- Special Award (특별상)
- 1st Hackathon: Luckython
- INU College of Information Technology

## Repository
GitHub: https://github.com/snwfld00/2024_Luckython
    `,
    tags: ['Hackathon', 'Award', 'Project'],
    category: 'Hackathon',
    github: 'https://github.com/snwfld00/2024_Luckython',
    featured: true,
    date: '2024-06-01',
  },
  {
    slug: 'pseudo-labeler',
    title: 'Pseudo Labeler',
    description: 'Semi-supervised learning tool for generating pseudo labels in object detection.',
    longDescription: `
Semi-supervised learning tool for generating and managing pseudo labels in object detection tasks.

## Overview
A utility for creating pseudo labels from unlabeled data to enhance semi-supervised learning pipelines.

## Key Features
- Pseudo label generation
- Quality filtering
- Integration with detection frameworks

## Repository
GitHub: https://github.com/snwfld00/Pseudo_Labeler
    `,
    tags: ['Semi-Supervised', 'Pseudo-labeling', 'Object Detection'],
    category: 'Semi-Supervised Learning',
    github: 'https://github.com/snwfld00/Pseudo_Labeler',
    featured: false,
    date: '2024-08-01',
  },
  {
    slug: 'vision-query',
    title: 'Vision Query',
    description: 'Vision-Language model project for querying and understanding visual content.',
    longDescription: `
Vision-Language model project for querying and understanding visual content.

## Overview
Research project exploring Vision-Language Models for visual query understanding.

## Repository
GitHub: https://github.com/snwfld00/Vision_Query
    `,
    tags: ['VLM', 'Vision-Language', 'Deep Learning'],
    category: 'Vision-Language',
    github: 'https://github.com/snwfld00/Vision_Query',
    featured: false,
    date: '2024-09-01',
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured)
}

export function getProjectsByCategory(category: string): Project[] {
  return projects.filter((p) => p.category === category)
}

export function getAllCategories(): string[] {
  return [...new Set(projects.map((p) => p.category))]
}
