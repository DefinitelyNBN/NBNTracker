from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class BillingFrequency(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class ExpenseCategory(str, Enum):
    FOOD = "food"
    TRANSPORTATION = "transportation"
    ENTERTAINMENT = "entertainment"
    UTILITIES = "utilities"
    SHOPPING = "shopping"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    OTHER = "other"

class SubscriptionCategory(str, Enum):
    STREAMING = "streaming"
    SOFTWARE = "software"
    UTILITIES = "utilities"
    FITNESS = "fitness"
    NEWS = "news"
    PRODUCTIVITY = "productivity"
    ENTERTAINMENT = "entertainment"
    OTHER = "other"

class BudgetType(str, Enum):
    ANNUAL = "annual"
    CATEGORY = "category"

# Models
class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    cost: float
    billing_frequency: BillingFrequency
    next_due_date: datetime
    category: SubscriptionCategory
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SubscriptionCreate(BaseModel):
    name: str
    cost: float
    billing_frequency: BillingFrequency
    next_due_date: datetime
    category: SubscriptionCategory

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    cost: Optional[float] = None
    billing_frequency: Optional[BillingFrequency] = None
    next_due_date: Optional[datetime] = None
    category: Optional[SubscriptionCategory] = None
    is_active: Optional[bool] = None

class Expense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    amount: float
    category: ExpenseCategory
    tags: List[str] = []
    notes: Optional[str] = None
    date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ExpenseCreate(BaseModel):
    name: str
    amount: float
    category: ExpenseCategory
    tags: List[str] = []
    notes: Optional[str] = None
    date: datetime

class ExpenseUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[ExpenseCategory] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None

class Budget(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: BudgetType
    amount: float
    category: Optional[str] = None  # Only for category budgets
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BudgetCreate(BaseModel):
    type: BudgetType
    amount: float
    category: Optional[str] = None

class DashboardStats(BaseModel):
    total_monthly_spending: float
    total_yearly_spending: float
    yearly_projection: float
    subscription_spending: float
    expense_spending: float
    upcoming_subscriptions: List[Subscription]
    category_breakdown: dict
    budget_alerts: List[str]

# Utility functions
def calculate_next_due_date(last_due: datetime, frequency: BillingFrequency) -> datetime:
    if frequency == BillingFrequency.MONTHLY:
        return last_due + timedelta(days=30)
    else:  # YEARLY
        return last_due + timedelta(days=365)

def get_monthly_cost(cost: float, frequency: BillingFrequency) -> float:
    if frequency == BillingFrequency.MONTHLY:
        return cost
    else:  # YEARLY
        return cost / 12

# Subscription endpoints
@api_router.post("/subscriptions", response_model=Subscription)
async def create_subscription(subscription_data: SubscriptionCreate):
    subscription = Subscription(**subscription_data.dict())
    result = await db.subscriptions.insert_one(subscription.dict())
    return subscription

@api_router.get("/subscriptions", response_model=List[Subscription])
async def get_subscriptions():
    subscriptions = await db.subscriptions.find({"is_active": True}).to_list(1000)
    return [Subscription(**sub) for sub in subscriptions]

@api_router.get("/subscriptions/{subscription_id}", response_model=Subscription)
async def get_subscription(subscription_id: str):
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return Subscription(**subscription)

@api_router.put("/subscriptions/{subscription_id}", response_model=Subscription)
async def update_subscription(subscription_id: str, update_data: SubscriptionUpdate):
    existing = await db.subscriptions.find_one({"id": subscription_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    if update_dict:
        await db.subscriptions.update_one({"id": subscription_id}, {"$set": update_dict})
    
    updated = await db.subscriptions.find_one({"id": subscription_id})
    return Subscription(**updated)

@api_router.delete("/subscriptions/{subscription_id}")
async def delete_subscription(subscription_id: str):
    result = await db.subscriptions.update_one(
        {"id": subscription_id}, 
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"message": "Subscription deleted successfully"}

# Expense endpoints
@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate):
    expense = Expense(**expense_data.dict())
    result = await db.expenses.insert_one(expense.dict())
    return expense

@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses():
    expenses = await db.expenses.find().to_list(1000)
    return [Expense(**exp) for exp in expenses]

@api_router.get("/expenses/{expense_id}", response_model=Expense)
async def get_expense(expense_id: str):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return Expense(**expense)

@api_router.put("/expenses/{expense_id}", response_model=Expense)
async def update_expense(expense_id: str, update_data: ExpenseUpdate):
    existing = await db.expenses.find_one({"id": expense_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    if update_dict:
        await db.expenses.update_one({"id": expense_id}, {"$set": update_dict})
    
    updated = await db.expenses.find_one({"id": expense_id})
    return Expense(**updated)

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    result = await db.expenses.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

# Budget endpoints
@api_router.post("/budgets", response_model=Budget)
async def create_budget(budget_data: BudgetCreate):
    # Delete existing budget of same type/category
    if budget_data.type == BudgetType.ANNUAL:
        await db.budgets.delete_many({"type": "annual"})
    else:
        await db.budgets.delete_many({"type": "category", "category": budget_data.category})
    
    budget = Budget(**budget_data.dict())
    result = await db.budgets.insert_one(budget.dict())
    return budget

@api_router.get("/budgets", response_model=List[Budget])
async def get_budgets():
    budgets = await db.budgets.find().to_list(1000)
    return [Budget(**budget) for budget in budgets]

@api_router.delete("/budgets/{budget_id}")
async def delete_budget(budget_id: str):
    result = await db.budgets.delete_one({"id": budget_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"message": "Budget deleted successfully"}

# Analytics endpoints
@api_router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    # Get current month and year
    now = datetime.utcnow()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get all active subscriptions
    subscriptions = await db.subscriptions.find({"is_active": True}).to_list(1000)
    subscription_objects = [Subscription(**sub) for sub in subscriptions]
    
    # Get all expenses
    expenses = await db.expenses.find().to_list(1000)
    expense_objects = [Expense(**exp) for exp in expenses]
    
    # Calculate subscription spending
    monthly_subscription_cost = sum(
        get_monthly_cost(sub.cost, sub.billing_frequency) 
        for sub in subscription_objects
    )
    yearly_subscription_cost = monthly_subscription_cost * 12
    
    # Calculate expense spending
    monthly_expenses = sum(
        exp.amount for exp in expense_objects 
        if exp.date >= current_month_start
    )
    yearly_expenses = sum(
        exp.amount for exp in expense_objects 
        if exp.date >= current_year_start
    )
    
    # Total spending
    total_monthly_spending = monthly_subscription_cost + monthly_expenses
    total_yearly_spending = yearly_subscription_cost + yearly_expenses
    yearly_projection = total_monthly_spending * 12
    
    # Upcoming subscriptions (next 7 days)
    upcoming_cutoff = now + timedelta(days=7)
    upcoming_subscriptions = [
        sub for sub in subscription_objects 
        if sub.next_due_date <= upcoming_cutoff
    ]
    
    # Category breakdown
    category_breakdown = {}
    
    # Add subscription categories
    for sub in subscription_objects:
        monthly_cost = get_monthly_cost(sub.cost, sub.billing_frequency)
        if sub.category.value not in category_breakdown:
            category_breakdown[sub.category.value] = 0
        category_breakdown[sub.category.value] += monthly_cost
    
    # Add expense categories (current month)
    for exp in expense_objects:
        if exp.date >= current_month_start:
            if exp.category.value not in category_breakdown:
                category_breakdown[exp.category.value] = 0
            category_breakdown[exp.category.value] += exp.amount
    
    # Budget alerts
    budget_alerts = []
    budgets = await db.budgets.find().to_list(1000)
    
    for budget_doc in budgets:
        budget = Budget(**budget_doc)
        if budget.type == BudgetType.ANNUAL:
            if yearly_projection > budget.amount:
                budget_alerts.append(f"⚠️ Annual budget exceeded! Projected: ₹{yearly_projection:,.2f}, Budget: ₹{budget.amount:,.2f}")
        else:  # Category budget
            category_spending = category_breakdown.get(budget.category, 0)
            if category_spending > budget.amount:
                budget_alerts.append(f"⚠️ {budget.category.title()} budget exceeded! Spent: ₹{category_spending:,.2f}, Budget: ₹{budget.amount:,.2f}")
    
    return DashboardStats(
        total_monthly_spending=total_monthly_spending,
        total_yearly_spending=total_yearly_spending,
        yearly_projection=yearly_projection,
        subscription_spending=monthly_subscription_cost,
        expense_spending=monthly_expenses,
        upcoming_subscriptions=upcoming_subscriptions,
        category_breakdown=category_breakdown,
        budget_alerts=budget_alerts
    )

# Smart suggestions endpoint
@api_router.get("/suggestions")
async def get_smart_suggestions():
    # Get dashboard stats for analysis
    stats = await get_dashboard_stats()
    suggestions = []
    
    # Get subscriptions sorted by cost
    subscriptions = await db.subscriptions.find({"is_active": True}).to_list(1000)
    subscription_objects = [Subscription(**sub) for sub in subscriptions]
    
    # Sort by monthly cost (highest first)
    subscription_objects.sort(
        key=lambda x: get_monthly_cost(x.cost, x.billing_frequency), 
        reverse=True
    )
    
    # Suggest canceling expensive subscriptions
    if len(subscription_objects) > 3:
        expensive_sub = subscription_objects[0]
        monthly_cost = get_monthly_cost(expensive_sub.cost, expensive_sub.billing_frequency)
        yearly_savings = monthly_cost * 12
        suggestions.append(f"💡 Consider canceling '{expensive_sub.name}' to save ₹{yearly_savings:,.2f} per year")
    
    # Analyze spending patterns
    category_breakdown = stats.category_breakdown
    if category_breakdown:
        # Find highest spending category
        highest_category = max(category_breakdown, key=category_breakdown.get)
        highest_amount = category_breakdown[highest_category]
        
        if highest_amount > 5000:  # If spending more than 5000 in a category
            suggestions.append(f"📊 High spending detected in {highest_category.title()}: ₹{highest_amount:,.2f} this month")
    
    # Budget suggestions
    if stats.yearly_projection > 100000:  # If yearly projection is high
        suggestions.append("💰 Consider setting category-wise budgets to better control spending")
    
    return {"suggestions": suggestions}

# Health check
@api_router.get("/")
async def root():
    return {"message": "NBNTracker API is running!", "status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()