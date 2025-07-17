#!/usr/bin/env python3
"""
NBNTracker Backend API Test Suite - Enhanced Features Testing
Tests all backend endpoints with focus on new enhanced features:
- Enhanced Expense Management with recurring expenses
- Advanced Budget Management with different budget types  
- Enhanced Dashboard Analytics with savings and spending trends
- Search and Filter Functionality
- Export and Categories endpoints
- Enhanced Smart Suggestions
"""

import requests
import json
from datetime import datetime, timedelta
import sys
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not get backend URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"🔗 Testing Enhanced NBNTracker API at: {API_URL}")

# Enhanced test data for new features
test_recurring_expense = {
    "name": "Grocery Shopping",
    "amount": 2000.0,
    "category": "food",
    "tags": ["groceries", "recurring", "monthly"],
    "notes": "Monthly grocery shopping - recurring expense",
    "date": datetime.now().isoformat(),
    "is_recurring": True,
    "recurring_frequency": "monthly"
}

test_expense_food = {
    "name": "Restaurant Meal",
    "amount": 500.0,
    "category": "food",
    "tags": ["restaurant", "dinner"],
    "notes": "Dinner at local restaurant",
    "date": datetime.now().isoformat(),
    "is_recurring": False
}

test_category_budget_food = {
    "type": "category",
    "amount": 5000.0,
    "category": "food",
    "period": "monthly"
}

test_annual_budget_yearly = {
    "type": "annual",
    "amount": 60000.0,
    "period": "yearly"
}

test_subscription_spotify = {
    "name": "Spotify Premium",
    "cost": 119.0,
    "billing_frequency": "monthly",
    "next_due_date": (datetime.now() + timedelta(days=5)).isoformat(),
    "category": "entertainment"
}

test_expense_transport = {
    "name": "Uber Ride",
    "amount": 250.0,
    "category": "transportation",
    "tags": ["uber", "transport"],
    "notes": "Ride to office",
    "date": (datetime.now() - timedelta(days=2)).isoformat(),
    "is_recurring": False
}

# Global variables to store created IDs
created_subscription_ids = []
created_expense_ids = []
created_budget_ids = []

def test_enhanced_expense_management():
    """Test Enhanced Expense Management with recurring expenses"""
    print("\n🔄 Testing Enhanced Expense Management...")
    
    # Test creating recurring expense
    try:
        response = requests.post(f"{API_URL}/expenses", json=test_recurring_expense)
        if response.status_code == 200:
            data = response.json()
            if ("id" in data and data["is_recurring"] == True and 
                data["recurring_frequency"] == "monthly" and 
                "next_due_date" in data):
                created_expense_ids.append(data["id"])
                print(f"✅ Recurring expense created successfully")
                print(f"   ID: {data['id']}")
                print(f"   Amount: ₹{data['amount']}")
                print(f"   Recurring: {data['is_recurring']}")
                print(f"   Frequency: {data['recurring_frequency']}")
                print(f"   Next Due: {data['next_due_date']}")
                recurring_success = True
            else:
                print("❌ Recurring expense response missing required fields")
                recurring_success = False
        else:
            print(f"❌ Recurring expense creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            recurring_success = False
    except Exception as e:
        print(f"❌ Recurring expense creation error: {e}")
        recurring_success = False
    
    # Test creating regular expense with tags and notes
    try:
        response = requests.post(f"{API_URL}/expenses", json=test_expense_food)
        if response.status_code == 200:
            data = response.json()
            if ("id" in data and "tags" in data and "notes" in data and 
                data["is_recurring"] == False):
                created_expense_ids.append(data["id"])
                print(f"✅ Regular expense with tags/notes created successfully")
                print(f"   ID: {data['id']}")
                print(f"   Tags: {data['tags']}")
                print(f"   Notes: {data['notes']}")
                regular_success = True
            else:
                print("❌ Regular expense response missing required fields")
                regular_success = False
        else:
            print(f"❌ Regular expense creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            regular_success = False
    except Exception as e:
        print(f"❌ Regular expense creation error: {e}")
        regular_success = False
    
    return recurring_success and regular_success

def test_advanced_budget_management():
    """Test Advanced Budget Management with different budget types"""
    print("\n💰 Testing Advanced Budget Management...")
    
    # Test category budget with period
    try:
        response = requests.post(f"{API_URL}/budgets", json=test_category_budget_food)
        if response.status_code == 200:
            data = response.json()
            if ("id" in data and data["type"] == "category" and 
                data["category"] == "food" and data["period"] == "monthly"):
                created_budget_ids.append(data["id"])
                print(f"✅ Category budget created successfully")
                print(f"   ID: {data['id']}")
                print(f"   Type: {data['type']}")
                print(f"   Category: {data['category']}")
                print(f"   Period: {data['period']}")
                print(f"   Amount: ₹{data['amount']}")
                category_success = True
            else:
                print("❌ Category budget response missing required fields")
                category_success = False
        else:
            print(f"❌ Category budget creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            category_success = False
    except Exception as e:
        print(f"❌ Category budget creation error: {e}")
        category_success = False
    
    # Test annual budget with yearly period
    try:
        response = requests.post(f"{API_URL}/budgets", json=test_annual_budget_yearly)
        if response.status_code == 200:
            data = response.json()
            if ("id" in data and data["type"] == "annual" and 
                data["period"] == "yearly"):
                created_budget_ids.append(data["id"])
                print(f"✅ Annual budget created successfully")
                print(f"   ID: {data['id']}")
                print(f"   Type: {data['type']}")
                print(f"   Period: {data['period']}")
                print(f"   Amount: ₹{data['amount']}")
                annual_success = True
            else:
                print("❌ Annual budget response missing required fields")
                annual_success = False
        else:
            print(f"❌ Annual budget creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            annual_success = False
    except Exception as e:
        print(f"❌ Annual budget creation error: {e}")
        annual_success = False
    
    # Test budget update
    if created_budget_ids:
        budget_id = created_budget_ids[0]
        update_data = {"amount": 6000.0, "period": "monthly"}
        try:
            response = requests.put(f"{API_URL}/budgets/{budget_id}", json=update_data)
            if response.status_code == 200:
                data = response.json()
                if data["amount"] == 6000.0:
                    print(f"✅ Budget updated successfully")
                    print(f"   New Amount: ₹{data['amount']}")
                    update_success = True
                else:
                    print("❌ Budget update did not apply changes correctly")
                    update_success = False
            else:
                print(f"❌ Budget update failed with status {response.status_code}")
                update_success = False
        except Exception as e:
            print(f"❌ Budget update error: {e}")
            update_success = False
    else:
        update_success = False
    
    return category_success and annual_success and update_success

def test_enhanced_dashboard_analytics():
    """Test Enhanced Dashboard Analytics with new fields"""
    print("\n📊 Testing Enhanced Dashboard Analytics...")
    
    # Create some test data first
    requests.post(f"{API_URL}/subscriptions", json=test_subscription_spotify)
    requests.post(f"{API_URL}/expenses", json=test_expense_transport)
    
    try:
        response = requests.get(f"{API_URL}/dashboard")
        if response.status_code == 200:
            data = response.json()
            
            # Check for new enhanced fields
            enhanced_fields = [
                "savings_this_month", "spending_trends", "upcoming_expenses"
            ]
            
            missing_fields = [field for field in enhanced_fields if field not in data]
            if not missing_fields:
                print("✅ Enhanced dashboard analytics working correctly")
                print(f"   Savings This Month: ₹{data['savings_this_month']:,.2f}")
                print(f"   Spending Trends: {len(data['spending_trends'])} months")
                print(f"   Upcoming Expenses: {len(data['upcoming_expenses'])} expenses")
                
                # Verify spending trends structure
                if data['spending_trends'] and len(data['spending_trends']) > 0:
                    trend = data['spending_trends'][0]
                    if all(key in trend for key in ['month', 'subscription_spending', 'expense_spending', 'total_spending']):
                        print("✅ Spending trends structure is correct")
                        print(f"   Latest trend: {trend['month']} - Total: ₹{trend['total_spending']:,.2f}")
                        trends_success = True
                    else:
                        print("❌ Spending trends missing required fields")
                        trends_success = False
                else:
                    print("⚠️ No spending trends data - may be expected")
                    trends_success = True
                
                # Check upcoming expenses structure
                if data['upcoming_expenses']:
                    upcoming = data['upcoming_expenses'][0]
                    if 'next_due_date' in upcoming and 'is_recurring' in upcoming:
                        print("✅ Upcoming expenses structure is correct")
                        upcoming_success = True
                    else:
                        print("❌ Upcoming expenses missing required fields")
                        upcoming_success = False
                else:
                    print("⚠️ No upcoming expenses - may be expected")
                    upcoming_success = True
                
                return trends_success and upcoming_success
            else:
                print(f"❌ Dashboard response missing enhanced fields: {missing_fields}")
                return False
        else:
            print(f"❌ Enhanced dashboard analytics failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Enhanced dashboard analytics error: {e}")
        return False

def test_search_and_filter_functionality():
    """Test Search and Filter Functionality"""
    print("\n🔍 Testing Search and Filter Functionality...")
    
    # Test subscription search and filters
    try:
        # Test search by name
        response = requests.get(f"{API_URL}/subscriptions?search=spotify")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Subscription search working - found {len(data)} results")
                search_success = True
            else:
                print("❌ Subscription search response not a list")
                search_success = False
        else:
            print(f"❌ Subscription search failed with status {response.status_code}")
            search_success = False
        
        # Test category filter
        response = requests.get(f"{API_URL}/subscriptions?category=entertainment")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Subscription category filter working - found {len(data)} results")
                category_filter_success = True
            else:
                print("❌ Subscription category filter response not a list")
                category_filter_success = False
        else:
            print(f"❌ Subscription category filter failed with status {response.status_code}")
            category_filter_success = False
    except Exception as e:
        print(f"❌ Subscription search/filter error: {e}")
        search_success = category_filter_success = False
    
    # Test expense search and filters
    try:
        # Test search by name
        response = requests.get(f"{API_URL}/expenses?search=grocery")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Expense search working - found {len(data)} results")
                expense_search_success = True
            else:
                print("❌ Expense search response not a list")
                expense_search_success = False
        else:
            print(f"❌ Expense search failed with status {response.status_code}")
            expense_search_success = False
        
        # Test recurring filter
        response = requests.get(f"{API_URL}/expenses?recurring_only=true")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Expense recurring filter working - found {len(data)} results")
                recurring_filter_success = True
            else:
                print("❌ Expense recurring filter response not a list")
                recurring_filter_success = False
        else:
            print(f"❌ Expense recurring filter failed with status {response.status_code}")
            recurring_filter_success = False
        
        # Test date range filter
        start_date = (datetime.now() - timedelta(days=7)).isoformat()
        end_date = datetime.now().isoformat()
        response = requests.get(f"{API_URL}/expenses?start_date={start_date}&end_date={end_date}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Expense date range filter working - found {len(data)} results")
                date_filter_success = True
            else:
                print("❌ Expense date range filter response not a list")
                date_filter_success = False
        else:
            print(f"❌ Expense date range filter failed with status {response.status_code}")
            date_filter_success = False
    except Exception as e:
        print(f"❌ Expense search/filter error: {e}")
        expense_search_success = recurring_filter_success = date_filter_success = False
    
    return (search_success and category_filter_success and 
            expense_search_success and recurring_filter_success and date_filter_success)

def test_export_and_categories():
    """Test Export and Categories endpoints"""
    print("\n📤 Testing Export and Categories...")
    
    # Test export endpoint
    try:
        response = requests.get(f"{API_URL}/export")
        if response.status_code == 200:
            data = response.json()
            required_fields = ["subscriptions", "expenses", "budgets", "export_date", "total_records"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print("✅ Export endpoint working correctly")
                print(f"   Subscriptions: {len(data['subscriptions'])}")
                print(f"   Expenses: {len(data['expenses'])}")
                print(f"   Budgets: {len(data['budgets'])}")
                print(f"   Total Records: {data['total_records']}")
                print(f"   Export Date: {data['export_date']}")
                export_success = True
            else:
                print(f"❌ Export response missing fields: {missing_fields}")
                export_success = False
        else:
            print(f"❌ Export endpoint failed with status {response.status_code}")
            export_success = False
    except Exception as e:
        print(f"❌ Export endpoint error: {e}")
        export_success = False
    
    # Test categories endpoint
    try:
        response = requests.get(f"{API_URL}/categories")
        if response.status_code == 200:
            data = response.json()
            required_fields = ["subscription_categories", "expense_categories", 
                             "billing_frequencies", "recurring_frequencies"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print("✅ Categories endpoint working correctly")
                print(f"   Subscription Categories: {len(data['subscription_categories'])}")
                print(f"   Expense Categories: {len(data['expense_categories'])}")
                print(f"   Billing Frequencies: {len(data['billing_frequencies'])}")
                print(f"   Recurring Frequencies: {len(data['recurring_frequencies'])}")
                categories_success = True
            else:
                print(f"❌ Categories response missing fields: {missing_fields}")
                categories_success = False
        else:
            print(f"❌ Categories endpoint failed with status {response.status_code}")
            categories_success = False
    except Exception as e:
        print(f"❌ Categories endpoint error: {e}")
        categories_success = False
    
    return export_success and categories_success

def test_enhanced_smart_suggestions():
    """Test Enhanced Smart Suggestions with new suggestion types"""
    print("\n💡 Testing Enhanced Smart Suggestions...")
    
    try:
        response = requests.get(f"{API_URL}/suggestions")
        if response.status_code == 200:
            data = response.json()
            if "suggestions" in data and isinstance(data["suggestions"], list):
                suggestions = data["suggestions"]
                print(f"✅ Enhanced smart suggestions working correctly")
                print(f"   Generated {len(suggestions)} suggestions")
                
                # Check for different types of suggestions
                suggestion_types = {
                    "savings": False,
                    "high_spending": False,
                    "budget": False,
                    "cancellation": False
                }
                
                for suggestion in suggestions:
                    if "save" in suggestion.lower() or "saved" in suggestion.lower():
                        suggestion_types["savings"] = True
                    if "high spending" in suggestion.lower():
                        suggestion_types["high_spending"] = True
                    if "budget" in suggestion.lower():
                        suggestion_types["budget"] = True
                    if "cancel" in suggestion.lower():
                        suggestion_types["cancellation"] = True
                    print(f"   • {suggestion}")
                
                found_types = sum(suggestion_types.values())
                print(f"✅ Found {found_types} different suggestion types")
                return True
            else:
                print("❌ Enhanced suggestions response missing 'suggestions' field or not a list")
                return False
        else:
            print(f"❌ Enhanced smart suggestions failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Enhanced smart suggestions error: {e}")
        return False

def test_health_check():
    """Test GET /api/ endpoint"""
    print("\n🏥 Testing Health Check...")
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "status" in data:
                print("✅ Health check passed")
                print(f"   Message: {data['message']}")
                print(f"   Status: {data['status']}")
                return True
            else:
                print("❌ Health check response missing required fields")
                return False
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def run_enhanced_tests():
    """Run all enhanced backend API tests"""
    print("🚀 Starting NBNTracker Enhanced Backend API Tests")
    print("=" * 60)
    
    test_results = {}
    
    # Enhanced feature tests
    test_results["health_check"] = test_health_check()
    test_results["enhanced_expense_management"] = test_enhanced_expense_management()
    test_results["advanced_budget_management"] = test_advanced_budget_management()
    test_results["enhanced_dashboard_analytics"] = test_enhanced_dashboard_analytics()
    test_results["search_and_filter_functionality"] = test_search_and_filter_functionality()
    test_results["export_and_categories"] = test_export_and_categories()
    test_results["enhanced_smart_suggestions"] = test_enhanced_smart_suggestions()
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 ENHANCED FEATURES TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall: {passed}/{total} enhanced tests passed")
    
    if passed == total:
        print("🎉 All enhanced backend API tests passed!")
        print("✅ NBNTracker enhanced features are fully functional!")
        return True
    else:
        print(f"⚠️ {total - passed} enhanced tests failed")
        return False

if __name__ == "__main__":
    success = run_enhanced_tests()
    sys.exit(0 if success else 1)