# Śmieci.go - Gamified Environmental Cleanup Application

A mobile application that gamifies environmental cleanup efforts, encouraging community involvement in litter collection and recycling through engaging game mechanics and social features.

## Description

This project addresses the growing challenge of urban and natural area littering by leveraging gamification and modern mobile technologies. The application motivates users to participate in environmental cleanup activities through:

- Real-time tracking of cleanup efforts
- Point-based reward system
- Community leaderboards
- Integration with government environmental data
- AI-powered verification of cleanup photos

## Features

- **Interactive Map**: Displays litter locations with status indicators
- **Photo Verification**: AI-powered system using YOLOv5 for validating cleanup photos
- **Gamification Elements**: 
  - Point system with daily passive accumulation
  - Community support mechanics
  - Weekly/Monthly/All-time leaderboards
- **User Management**: OAuth-based authentication and role-based permissions
- **Government Integration**: Integration with national environmental threat mapping systems

## Tech Stack

### Backend
- Go (Golang)
- Gin Framework
- PostgreSQL
- Docker
- YOLOv5 (AI model for image verification)

### Frontend
- React Native
- Expo
- TypeScript
- Nativewind (Tailwind CSS for React Native)
- React Query

### Authentication & User Management
- Clerk
- JWT (JSON Web Tokens)
- OAuth 2.0

### Development Tools
- Git
- GitHub Actions (CI/CD)
- Docker Compose

## Architecture

The application follows a client-server architecture with:
- RESTful API backend
- Cross-platform mobile frontend
- Automated testing pipeline
- Docker-based deployment
- Webhook-based integrations

## Future Development Plans

- Group cleanup event organization system
- Enhanced statistical analysis of user activities
- Integration with additional pollution data sources
- Improvements to the automatic photo verification system

## Authors

- Piotr Skowroński (Fullstack development, Infrastructure)
- Krzysztof Czuba (Fullstack development, Project management)

## Acknowledgments

This project was developed as an engineering thesis at the Silesian University of Technology, Faculty of Applied Mathematics.
