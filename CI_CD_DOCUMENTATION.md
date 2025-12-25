# CI/CD Pipeline Documentation - NeuraLens

## 🚀 Overview

NeuraLens uses **GitHub Actions** for continuous integration and deployment. The pipeline automatically builds, tests, and deploys all three components of the system.

---

## 📋 Workflows

### 1. **CI/CD Pipeline** (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

**Jobs:**

#### Frontend Build & Test
- **Runtime**: Node.js 22
- **Steps**:
  1. Install dependencies (`npm ci`)
  2. Lint code (`npm run lint`)
  3. Build production bundle (`npm run build`)
  4. Upload artifacts

#### Backend Build & Test
- **Runtime**: .NET 9
- **Steps**:
  1. Restore NuGet packages
  2. Build in Release mode
  3. Run unit tests
  4. Code analysis

#### CV Engine Build
- **Runtime**: Python 3.11
- **Steps**:
  1. Install pip dependencies
  2. Lint with Flake8
  3. Validate imports

#### Docker Image Build
- **Triggers**: Only on push to `main`
- **Registry**: GitHub Container Registry (ghcr.io)
- **Images**:
  - `ghcr.io/<username>/neuralens/frontend:latest`
  - `ghcr.io/<username>/neuralens/backend:latest`
  - `ghcr.io/<username>/neuralens/cv-engine:latest`

#### Azure Deployment
- **Trigger**: Manual workflow dispatch only
- **Environment**: Production
- **Target**: Azure Container Apps

---

### 2. **Code Quality Checks** (`code-quality.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Push to `develop`

**Checks:**

#### Frontend
- ESLint (code linting)
- Prettier (formatting)
- TypeScript type checking

#### Backend
- .NET code analysis
- Format verification

#### Python
- Flake8 (linting)
- Black (formatting)
- MyPy (type checking)

#### Security
- Trivy vulnerability scanning
- SARIF upload to GitHub Security

---

## 🔧 Setup Instructions

### 1. **Enable GitHub Actions**

Actions are automatically enabled for this repository.

### 2. **Configure Secrets**

Add the following secrets in **Settings → Secrets and variables → Actions**:

#### Required Secrets:

```
AZURE_CREDENTIALS
```

**How to get Azure credentials:**
```bash
az ad sp create-for-rbac \
  --name "neuralens-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
  --sdk-auth
```

Copy the JSON output and paste as `AZURE_CREDENTIALS`.

#### Optional Secrets:
```
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_KEY
COSMOS_DB_CONNECTION_STRING
BLOB_STORAGE_CONNECTION_STRING
```

---

## 📊 Pipeline Status

### Current Status:
- ✅ Frontend build configured
- ✅ Backend build configured
- ✅ CV Engine build configured
- ✅ Docker image build configured
- ⏳ Azure deployment (requires secrets)

### Build Badges:

Add to README.md:

```markdown
![CI/CD Pipeline](https://github.com/<username>/neuralens-imaginecup-2025/actions/workflows/ci-cd.yml/badge.svg)
![Code Quality](https://github.com/<username>/neuralens-imaginecup-2025/actions/workflows/code-quality.yml/badge.svg)
```

---

## 🐳 Docker Images

### Building Locally:

```bash
# Frontend
docker build -t neuralens-frontend ./src/ChatApp.React

# Backend
docker build -t neuralens-backend ./src/ChatApp.WebApi

# CV Engine
docker build -t neuralens-cv-engine ./src/cv-engine
```

### Running Locally:

```bash
# Frontend
docker run -p 5173:80 neuralens-frontend

# Backend
docker run -p 3000:3000 neuralens-backend

# CV Engine
docker run -p 8000:8000 neuralens-cv-engine
```

### Pulling from Registry:

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/<username>/neuralens/frontend:latest
docker pull ghcr.io/<username>/neuralens/backend:latest
docker pull ghcr.io/<username>/neuralens/cv-engine:latest
```

---

## 🌐 Deployment

### Manual Deployment:

1. Go to **Actions** tab
2. Select **CI/CD Pipeline** workflow
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow** button

### Automatic Deployment:

Currently disabled. To enable:
1. Add Azure credentials to secrets
2. Update `deploy-azure` job in `ci-cd.yml`
3. Remove `if: github.event_name == 'workflow_dispatch'` condition

---

## 📝 Workflow Files

### Location:
```
.github/
└── workflows/
    ├── ci-cd.yml           # Main CI/CD pipeline
    └── code-quality.yml    # Code quality checks
```

### Customization:

#### Change Node.js version:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'  # Change this
```

#### Change Python version:
```yaml
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'  # Change this
```

#### Add environment variables:
```yaml
env:
  CUSTOM_VAR: value
```

---

## 🔍 Monitoring

### View Workflow Runs:
1. Go to **Actions** tab
2. Select workflow
3. View run details

### Download Artifacts:
1. Open completed workflow run
2. Scroll to **Artifacts** section
3. Download `frontend-dist`

### View Logs:
1. Click on workflow run
2. Click on job name
3. Expand step to view logs

---

## 🚨 Troubleshooting

### Build Fails:

**Frontend:**
```bash
# Locally test build
cd src/ChatApp.React
npm ci
npm run build
```

**Backend:**
```bash
# Locally test build
cd src/ChatApp.WebApi
dotnet restore
dotnet build --configuration Release
```

**CV Engine:**
```bash
# Locally test build
cd src/cv-engine
pip install -r requirements.txt
```

### Docker Build Fails:

```bash
# Test Docker build locally
docker build -t test-image ./src/ChatApp.React
```

### Deployment Fails:

1. Check Azure credentials are valid
2. Verify resource group exists
3. Check Azure CLI commands in workflow

---

## 📈 Performance

### Build Times (Approximate):
- Frontend: 2-3 minutes
- Backend: 3-4 minutes
- CV Engine: 2-3 minutes
- Docker builds: 5-10 minutes each
- Total pipeline: ~20-30 minutes

### Optimization Tips:
1. Use caching for dependencies
2. Run jobs in parallel
3. Skip tests on draft PRs
4. Use smaller Docker base images

---

## 🎯 Best Practices

### Branch Strategy:
```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

### Commit Messages:
```
feat: Add new feature
fix: Fix bug
chore: Update dependencies
docs: Update documentation
ci: Update CI/CD pipeline
```

### Pull Requests:
1. Create PR from `feature/*` to `develop`
2. Wait for CI checks to pass
3. Get code review
4. Merge to `develop`
5. Test in staging
6. Create PR from `develop` to `main`
7. Deploy to production

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/)

---

## ✅ Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code quality checks passing
- [ ] Security scan clean
- [ ] Docker images built successfully
- [ ] Azure credentials configured
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Backup created
- [ ] Monitoring configured
- [ ] Rollback plan ready

---

**Status**: ✅ CI/CD Pipeline Configured

**Next Steps**:
1. Configure Azure credentials
2. Test manual deployment
3. Enable automatic deployment
4. Set up monitoring
