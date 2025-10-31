# VsuCNHSnews - College of Natural Health Sciences News Website

This repository contains the source code for **VsuCNHSnews**, a dynamic news website built for the **College of Natural Health Sciences (CNHS)** at VSU. The project uses **Next.js** for the frontend and **Firebase** for authentication, database, and media storage. It showcases real-time news updates, user authentication, and a modern, responsive design.

## Features

- **User Authentication**: Authors can log in and create news posts using Firebase Authentication.
- **Real-time News Updates**: News posts are stored in Firebase Firestore and fetched in real-time.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS for seamless experience across devices.
- **SEO Optimized**: Utilizes Next.js static generation (SSG) and server-side rendering (SSR) for improved search engine visibility.
- **Media Upload**: Cover photos for news articles are uploaded and served via Firebase Storage.
- **Latest News Cache**: Frequently accessed latest news posts are cached for faster retrieval.

## Prerequisites

Before you begin, ensure you have:

- Node.js 14.x or higher
- npm or yarn installed
- Firebase account with Firestore, Authentication, and Storage enabled

## Project Structure

- **/src/app** – Next.js application pages and components
- **/src/firebase.ts** – Firebase client initialization
- **/public** – Static assets (images, icons)
- **/types.ts** – TypeScript types
- **/tailwind.config.ts** – Tailwind CSS configuration
- **/next.config.mjs** – Next.js configuration

## Getting Started

VsuCNHSnews is hosted on **Vercel** for live access. To run or develop locally, follow these steps:

1. Clone the repository: