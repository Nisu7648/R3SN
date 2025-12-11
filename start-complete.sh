#!/bin/bash

###############################################################################
# R3SN Complete Startup Script
# Validates, initializes, and starts the complete R3SN platform
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║                  R3SN Platform Startup                     ║"
    echo "║          Revolutionary AI Automation Platform              ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main script
main() {
    print_header

    # Step 1: Check Prerequisites
    print_step "Step 1: Checking Prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js >= 18.0.0"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be >= 18.0.0 (current: $(node -v))"
        exit 1
    fi
    print_success "Node.js $(node -v) installed"

    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm -v) installed"

    if ! command_exists mongod && ! command_exists docker; then
        print_warning "MongoDB not found. Will use Docker or remote MongoDB"
    else
        print_success "MongoDB available"
    fi

    # Step 2: Check Environment Configuration
    print_step "Step 2: Checking Environment Configuration..."
    
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file"
            print_warning "Please edit .env file with your configuration"
            echo ""
            echo "Required variables:"
            echo "  - MONGODB_URI"
            echo "  - JWT_SECRET"
            echo "  - OPENAI_API_KEY (for AI features)"
            echo ""
            read -p "Press Enter after configuring .env file..."
        else
            print_error ".env.example not found"
            exit 1
        fi
    else
        print_success ".env file exists"
    fi

    # Step 3: Install Dependencies
    print_step "Step 3: Installing Dependencies..."
    
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Installing..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi

    # Step 4: Run System Validation
    print_step "Step 4: Running System Validation..."
    
    if npm run validate; then
        print_success "System validation passed"
    else
        print_error "System validation failed"
        print_warning "Continuing anyway... Fix issues before production deployment"
    fi

    # Step 5: Check Database Connection
    print_step "Step 5: Checking Database Connection..."
    
    # Try to connect to MongoDB
    if command_exists mongosh; then
        MONGO_URI=$(grep MONGODB_URI .env | cut -d '=' -f2)
        if mongosh "$MONGO_URI" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            print_success "MongoDB connection successful"
        else
            print_warning "Could not connect to MongoDB. Make sure MongoDB is running"
        fi
    else
        print_warning "mongosh not installed. Skipping database check"
    fi

    # Step 6: Seed Database
    print_step "Step 6: Seeding Database..."
    
    read -p "Do you want to seed the database with 800+ integrations? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run seed
        print_success "Database seeded successfully"
    else
        print_warning "Skipping database seeding"
    fi

    # Step 7: Run Health Check
    print_step "Step 7: Running Health Check..."
    
    if npm run health; then
        print_success "Health check passed"
    else
        print_warning "Health check failed. System may not be fully operational"
    fi

    # Step 8: Run Tests (Optional)
    print_step "Step 8: Running Tests (Optional)..."
    
    read -p "Do you want to run tests? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm test
        print_success "Tests completed"
    else
        print_warning "Skipping tests"
    fi

    # Step 9: Choose Startup Mode
    print_step "Step 9: Choose Startup Mode..."
    
    echo ""
    echo "Select startup mode:"
    echo "  1) Development (with hot-reload)"
    echo "  2) Production"
    echo "  3) Docker (recommended)"
    echo "  4) Exit"
    echo ""
    read -p "Enter choice [1-4]: " choice

    case $choice in
        1)
            print_step "Starting in Development Mode..."
            npm run dev
            ;;
        2)
            print_step "Starting in Production Mode..."
            npm start
            ;;
        3)
            print_step "Starting with Docker..."
            if ! command_exists docker; then
                print_error "Docker is not installed"
                exit 1
            fi
            if ! command_exists docker-compose; then
                print_error "Docker Compose is not installed"
                exit 1
            fi
            docker-compose up -d
            print_success "Docker containers started"
            echo ""
            echo "View logs: docker-compose logs -f app"
            echo "Stop: docker-compose down"
            ;;
        4)
            print_warning "Exiting without starting server"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac

    # Final Message
    echo ""
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║              R3SN Platform Started Successfully!           ║"
    echo "║                                                            ║"
    echo "║  Server running at: http://localhost:3000                  ║"
    echo "║  API Documentation: http://localhost:3000/api/docs         ║"
    echo "║  Health Check: http://localhost:3000/health                ║"
    echo "║                                                            ║"
    echo "║  Next Steps:                                               ║"
    echo "║  1. Register a user: POST /api/auth/register               ║"
    echo "║  2. Login: POST /api/auth/login                            ║"
    echo "║  3. Create an agent: POST /api/agents                      ║"
    echo "║  4. Execute a prompt: POST /api/agents/execute-prompt      ║"
    echo "║                                                            ║"
    echo "║  Documentation: See README.md and docs/ folder             ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Run main function
main
