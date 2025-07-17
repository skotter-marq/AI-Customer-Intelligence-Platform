# Contributing to AI Customer Intelligence Platform

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Request Process

1. **Fork the repository** and create your branch from `main`
2. **Update the documentation** if you've changed APIs or added functionality
3. **Ensure your code follows** the existing style conventions
4. **Add tests** for any new functionality
5. **Update the changelog** if applicable
6. **Ensure all tests pass** before submitting
7. **Submit a pull request** with a clear description

## Code Style Guidelines

### JavaScript/TypeScript
- Use **TypeScript** for new components and API routes
- Follow **ESLint** configuration (run `npm run lint`)
- Use **Prettier** for code formatting
- **Async/await** preferred over promises
- **Error handling** with try/catch blocks

### React Components
- Use **functional components** with hooks
- **Props interfaces** for TypeScript components
- **Tailwind CSS** for styling
- **Descriptive component names**

### API Routes
- **RESTful** endpoint design
- **Proper HTTP status codes**
- **Error handling middleware**
- **Request validation**

### Database
- **Descriptive table/column names**
- **Proper indexes** for performance
- **Foreign key constraints**
- **Migration scripts** for schema changes

## Project Structure

```
ai-customer-intelligence/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── components/        # React components
├── lib/                   # Utility functions
├── database/              # SQL migration scripts
├── docs/                  # Documentation
├── tests/                 # Test files
└── webhook-only/          # Webhook-only deployment
```

## Setting Up Development Environment

### 1. Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account
- HubSpot developer account
- Basic understanding of React/Next.js

### 2. Local Setup
```bash
# Clone your fork
git clone https://github.com/yourusername/ai-customer-intelligence.git
cd ai-customer-intelligence

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Setup database (run SQL scripts in database/ folder)
# Configure your .env.local with API keys

# Start development server
npm run dev --turbopack
```

### 3. Testing Your Changes
```bash
# Run linting
npm run lint

# Run tests
npm test

# Test webhook endpoints
node test-webhook.js

# Test integrations
npm run test:integrations
```

## Issue Reporting

### Bug Reports
When filing a bug report, please include:

1. **Clear description** of the problem
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, Node.js version, etc.)
5. **Screenshots** if applicable
6. **Error logs** from console or server

### Feature Requests
When requesting a feature:

1. **Clear description** of the desired functionality
2. **Use case** - why is this feature needed?
3. **Acceptance criteria** - what would make this complete?
4. **Priority level** - how important is this feature?

## Task Management

### Current Initiatives
The project is organized into strategic initiatives:

1. **Customer Research System** ⭐ PRIMARY FOCUS
2. **Competitive Intelligence Agent**
3. **Marketing Content Pipeline**
4. **Automated Product Updates** ⭐ NEW INITIATIVE

### Task Naming Convention
- **T001-T099**: Foundation tasks
- **T100-T199**: Integration tasks
- **T200-T299**: AI/ML tasks
- **T300-T399**: UI/UX tasks
- **T400-T499**: Product updates tasks

### Status Indicators
- ✅ **COMPLETE** - Task finished and tested
- 🔄 **IN PROGRESS** - Currently being worked on
- ⏳ **PENDING** - Not started yet
- 🆕 **NEW** - Recently added task

## Code Review Process

### For Contributors
1. **Self-review** your code before submitting
2. **Write clear commit messages** following conventional commits
3. **Keep PRs focused** - one feature/fix per PR
4. **Respond to feedback** promptly and professionally

### For Reviewers
1. **Review for functionality** - does it work as expected?
2. **Check code quality** - is it maintainable and readable?
3. **Verify tests** - are there appropriate tests?
4. **Consider performance** - any performance implications?
5. **Security review** - any security concerns?

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```
feat(hubspot): add contact sync functionality
fix(webhook): resolve timeout issues in grain endpoint
docs(api): update webhook documentation
test(integration): add tests for JIRA webhook
```

## Release Process

### Version Numbering
We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Steps
1. **Update version** in package.json
2. **Update CHANGELOG.md** with release notes
3. **Create release branch** from main
4. **Test thoroughly** in staging environment
5. **Merge to main** and tag release
6. **Deploy to production**

## Integration Guidelines

### Adding New Integrations
1. **Create integration module** in `lib/` directory
2. **Add database tables** if needed (with migration script)
3. **Create API endpoints** for webhook/sync functionality
4. **Add environment variables** to .env.example
5. **Update documentation** and README
6. **Add tests** for integration functionality

### Webhook Development
1. **Follow existing patterns** in `app/api/`
2. **Handle errors gracefully** with appropriate HTTP codes
3. **Validate incoming data** before processing
4. **Log important events** for debugging
5. **Configure timeouts** appropriately in vercel.json

## Documentation Standards

### Code Documentation
- **JSDoc comments** for functions and classes
- **TypeScript interfaces** for data structures
- **README files** for complex modules
- **Inline comments** for complex logic

### Project Documentation
- **Keep docs up to date** with code changes
- **Use clear, concise language**
- **Include examples** where helpful
- **Update Project Instructions.md** for major changes

## Getting Help

### Resources
- **Project Instructions.md** - Comprehensive project documentation
- **CLAUDE.md** - Development guidance for AI assistants
- **docs/** folder - Technical documentation
- **GitHub Discussions** - Community help and questions

### Contact
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and discussions
- **Pull Request comments** - Code-specific questions

## Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **CHANGELOG.md** release notes
- **GitHub contributors** page

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

**Thank you for contributing to AI Customer Intelligence Platform!** 🚀
