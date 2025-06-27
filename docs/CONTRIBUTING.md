# Contributing to Hospital Management System

Thank you for your interest in contributing to the Hospital Management System! This guide will help you get started with contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- **Be respectful** and inclusive of different viewpoints and experiences
- **Be collaborative** and constructive in discussions and feedback
- **Be patient** with newcomers and help them learn
- **Focus on what's best** for the community and the project
- **Show empathy** towards other community members

## How to Contribute

### 1. Reporting Issues

Before creating an issue, please:

- **Search existing issues** to avoid duplicates
- **Use a clear and descriptive title**
- **Provide detailed information** about the problem
- **Include steps to reproduce** the issue if applicable
- **Add relevant labels** (bug, enhancement, documentation, etc.)

#### Bug Report Template

```markdown
## Bug Description

A clear and concise description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

A clear description of what you expected to happen.

## Actual Behavior

A clear description of what actually happened.

## Environment

- OS: [e.g., Windows 10, macOS Big Sur, Ubuntu 20.04]
- Node.js version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 91, Firefox 89]
- Hospital Management System version: [e.g., 1.0.0]

## Screenshots

If applicable, add screenshots to help explain your problem.

## Additional Context

Add any other context about the problem here.
```

#### Feature Request Template

```markdown
## Feature Description

A clear and concise description of what you want to happen.

## Problem Statement

A clear description of what problem this feature would solve.

## Proposed Solution

Describe the solution you'd like to see implemented.

## Alternative Solutions

Describe any alternative solutions you've considered.

## Additional Context

Add any other context, mockups, or examples about the feature request.
```

### 2. Contributing Code

#### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/hospital-management-system.git
   cd hospital-management-system
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/hospital-management-system.git
   ```
4. **Install dependencies**:

   ```bash
   # Backend
   cd backend && npm install

   # Frontend
   cd ../frontend && npm install
   ```

5. **Set up environment variables** (see INSTALLATION_GUIDE.md)
6. **Run the application** to ensure everything works

#### Development Workflow

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/issue-description
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:

   ```bash
   # Backend tests
   cd backend && npm test

   # Frontend tests
   cd frontend && npm test

   # Manual testing
   npm run dev
   ```

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "feat: add user profile management feature"
   ```

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

#### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**

```bash
feat: add patient search functionality
fix: resolve appointment scheduling conflict
docs: update installation guide
style: format code according to prettier rules
refactor: optimize database queries in user controller
perf: improve invoice loading performance
test: add unit tests for authentication middleware
chore: update dependencies to latest versions
```

### 3. Pull Request Guidelines

#### Before Submitting

- **Update from upstream**:
  ```bash
  git fetch upstream
  git rebase upstream/main
  ```
- **Ensure all tests pass**
- **Follow coding standards**
- **Update documentation** if needed
- **Add tests** for new functionality

#### Pull Request Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues

Fixes #123
Closes #456

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] New tests added for new functionality

## Screenshots (if applicable)

Add screenshots to show the changes.

## Checklist

- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Coding Standards

### Backend (Node.js/Express)

#### File Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Mongoose models
├── routes/         # Express routes
├── scripts/        # Utility scripts
├── tests/          # Test files
└── utils/          # Utility functions
```

#### Naming Conventions

- **Files**: camelCase (e.g., `userController.js`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)
- **Classes**: PascalCase (e.g., `UserModel`)

#### Code Style

```javascript
// Use async/await instead of callbacks
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ status: "success", data: { user } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Use destructuring
const { firstName, lastName, email } = req.body;

// Use template literals
const message = `Welcome ${firstName} ${lastName}!`;

// Use arrow functions for simple operations
const users = await User.find().map((user) => ({
  id: user._id,
  name: `${user.firstName} ${user.lastName}`,
}));
```

### Frontend (React)

#### File Structure

```
frontend/src/
├── components/      # Reusable components
├── pages/          # Page components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── services/       # API services
├── utils/          # Utility functions
└── assets/         # Static assets
```

#### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Files**: PascalCase for components, camelCase for others
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Variables**: camelCase (e.g., `userData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

#### Code Style

```jsx
// Use functional components with hooks
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-profile">
      <h1>
        {user.firstName} {user.lastName}
      </h1>
      <p>{user.email}</p>
    </div>
  );
};

export default UserProfile;
```

### CSS/Styling

We use **TailwindCSS** for styling:

```jsx
// Good - use Tailwind utility classes
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold text-gray-800 mb-4">
    Patient Information
  </h2>
</div>

// Avoid custom CSS unless necessary
// If needed, use CSS modules or styled-components
```

### Database (MongoDB)

#### Schema Design

```javascript
// Use clear field names and proper validation
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    maxlength: [50, "First name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  // Always include timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ firstName: 1, lastName: 1 });
```

## Testing Guidelines

### Backend Testing

```javascript
// Use Jest for unit and integration tests
describe("User Controller", () => {
  describe("POST /users", () => {
    test("should create a new user with valid data", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe(userData.email);
    });

    test("should return 400 for invalid email", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe("fail");
    });
  });
});
```

### Frontend Testing

```jsx
// Use React Testing Library
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserProfile from "../UserProfile";

describe("UserProfile Component", () => {
  test("renders user information correctly", async () => {
    const mockUser = {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    };

    // Mock API call
    jest.spyOn(api, "get").mockResolvedValue({
      data: { user: mockUser },
    });

    render(<UserProfile userId="1" />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });
});
```

## Documentation Guidelines

### Code Documentation

```javascript
/**
 * Creates a new patient record in the database
 * @param {Object} patientData - The patient information
 * @param {string} patientData.firstName - Patient's first name
 * @param {string} patientData.lastName - Patient's last name
 * @param {string} patientData.email - Patient's email address
 * @param {Date} patientData.dateOfBirth - Patient's date of birth
 * @returns {Promise<Object>} The created patient object
 * @throws {ValidationError} When patient data is invalid
 * @throws {DuplicateError} When patient email already exists
 */
const createPatient = async (patientData) => {
  // Implementation here
};
```

### API Documentation

When adding new endpoints, update the API documentation:

````markdown
### Create Patient

**POST** `/patients`

Creates a new patient record.

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "dateOfBirth": "string (YYYY-MM-DD)"
}
```
````

**Response:**

```json
{
  "status": "success",
  "data": {
    "patient": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    }
  }
}
```

````

## Security Guidelines

### Input Validation
```javascript
// Always validate and sanitize input
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).trim(),
  body('firstName').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array()
      });
    }
    next();
  }
];
````

### Authentication & Authorization

```javascript
// Always check permissions
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "Insufficient permissions",
      });
    }

    next();
  };
};
```

## Performance Guidelines

### Database Optimization

```javascript
// Use indexes for frequently queried fields
userSchema.index({ email: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });

// Use lean() for read-only operations
const patients = await Patient.find().lean();

// Use aggregation for complex queries
const stats = await Invoice.aggregate([
  { $match: { status: "paid" } },
  { $group: { _id: "$doctorId", total: { $sum: "$totalAmount" } } },
]);
```

### Frontend Optimization

```jsx
// Use React.memo for expensive components
const PatientCard = React.memo(({ patient }) => {
  return (
    <div className="patient-card">
      <h3>
        {patient.firstName} {patient.lastName}
      </h3>
    </div>
  );
});

// Use useMemo for expensive calculations
const sortedPatients = useMemo(() => {
  return patients.sort((a, b) => a.lastName.localeCompare(b.lastName));
}, [patients]);
```

## Release Process

1. **Create a release branch**: `git checkout -b release/v1.1.0`
2. **Update version numbers** in package.json files
3. **Update CHANGELOG.md** with new features and fixes
4. **Run full test suite** and ensure all tests pass
5. **Create pull request** for release branch
6. **After merge**: Create and push git tag
7. **Deploy to production** following deployment guide

## Getting Help

- **Documentation**: Check existing documentation first
- **Issues**: Search GitHub issues for similar problems
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for help in pull request comments
- **Community**: Join our community channels for real-time help

## Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** file
- **GitHub contributors** section
- **Release notes** for significant contributions
- **Special mentions** for outstanding contributions

Thank you for contributing to the Hospital Management System! 🎉
