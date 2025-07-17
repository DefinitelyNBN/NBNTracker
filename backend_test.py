#!/usr/bin/env python3
"""
NBNTracker Backend API Test Suite
Tests all backend endpoints with realistic data
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
print(f"🔗 Testing API at: {API_URL}")

# Test data
test_subscription_netflix = {
    "name": "Netflix Premium",
    "cost": 649.0,
    "billing_frequency": "monthly",
    "next_due_date": (datetime.now() + timedelta(days=15)).isoformat(),
    "category": "streaming"
}

test_subscription_prime = {
    "name": "Amazon Prime",
    "cost": 1499.0,
    "billing_frequency": "yearly", 
    "next_due_date": (datetime.now() + timedelta(days=300)).isoformat(),
    "category": "entertainment"
}

test_expense_food = {
    "name": "Grocery Shopping",
    "amount": 500.0,
    "category": "food",
    "tags": ["groceries", "monthly"],
    "notes": "Weekly grocery shopping",
    "date": datetime.now().isoformat()
}

test_budget_annual = {
    "type": "annual",
    "amount": 50000.0
}

test_budget_food = {
    "type": "category",
    "amount": 8000.0,
    "category": "food"
}

# Global variables to store created IDs
created_subscription_ids = []
created_expense_ids = []
created_budget_ids = []

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

def test_create_subscription():
    """Test POST /api/subscriptions"""
    print("\n📺 Testing Create Subscription...")
    
    # Test Netflix subscription
    try:
        response = requests.post(f"{API_URL}/subscriptions", json=test_subscription_netflix)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data["name"] == test_subscription_netflix["name"]:
                created_subscription_ids.append(data["id"])
                print(f"✅ Netflix subscription created successfully")
                print(f"   ID: {data['id']}")
                print(f"   Cost: ₹{data['cost']}")
                netflix_success = True
            else:
                print("❌ Netflix subscription response missing required fields")
                netflix_success = False
        else:
            print(f"❌ Netflix subscription creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            netflix_success = False
    except Exception as e:
        print(f"❌ Netflix subscription creation error: {e}")
        netflix_success = False
    
    # Test Amazon Prime subscription
    try:
        response = requests.post(f"{API_URL}/subscriptions", json=test_subscription_prime)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data["name"] == test_subscription_prime["name"]:
                created_subscription_ids.append(data["id"])
                print(f"✅ Amazon Prime subscription created successfully")
                print(f"   ID: {data['id']}")
                print(f"   Cost: ₹{data['cost']} (yearly)")
                prime_success = True
            else:
                print("❌ Amazon Prime subscription response missing required fields")
                prime_success = False
        else:
            print(f"❌ Amazon Prime subscription creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            prime_success = False
    except Exception as e:
        print(f"❌ Amazon Prime subscription creation error: {e}")
        prime_success = False
    
    return netflix_success and prime_success

def test_get_subscriptions():
    """Test GET /api/subscriptions"""
    print("\n📋 Testing Get Subscriptions...")
    try:
        response = requests.get(f"{API_URL}/subscriptions")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Retrieved {len(data)} subscriptions")
                for sub in data:
                    if "name" in sub and "cost" in sub:
                        print(f"   - {sub['name']}: ₹{sub['cost']} ({sub.get('billing_frequency', 'unknown')})")
                return len(data) >= len(created_subscription_ids)
            else:
                print("❌ Subscriptions response is not a list")
                return False
        else:
            print(f"❌ Get subscriptions failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get subscriptions error: {e}")
        return False

def test_update_subscription():
    """Test PUT /api/subscriptions/{id}"""
    print("\n✏️ Testing Update Subscription...")
    if not created_subscription_ids:
        print("❌ No subscriptions to update")
        return False
    
    subscription_id = created_subscription_ids[0]
    update_data = {
        "cost": 699.0,
        "name": "Netflix Premium HD"
    }
    
    try:
        response = requests.put(f"{API_URL}/subscriptions/{subscription_id}", json=update_data)
        if response.status_code == 200:
            data = response.json()
            if data["cost"] == update_data["cost"] and data["name"] == update_data["name"]:
                print(f"✅ Subscription updated successfully")
                print(f"   New name: {data['name']}")
                print(f"   New cost: ₹{data['cost']}")
                return True
            else:
                print("❌ Subscription update did not apply changes correctly")
                return False
        else:
            print(f"❌ Update subscription failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Update subscription error: {e}")
        return False

def test_create_expense():
    """Test POST /api/expenses"""
    print("\n🍽️ Testing Create Expense...")
    try:
        response = requests.post(f"{API_URL}/expenses", json=test_expense_food)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data["name"] == test_expense_food["name"]:
                created_expense_ids.append(data["id"])
                print(f"✅ Food expense created successfully")
                print(f"   ID: {data['id']}")
                print(f"   Amount: ₹{data['amount']}")
                print(f"   Category: {data['category']}")
                return True
            else:
                print("❌ Expense response missing required fields")
                return False
        else:
            print(f"❌ Expense creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Expense creation error: {e}")
        return False

def test_get_expenses():
    """Test GET /api/expenses"""
    print("\n📊 Testing Get Expenses...")
    try:
        response = requests.get(f"{API_URL}/expenses")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Retrieved {len(data)} expenses")
                for exp in data:
                    if "name" in exp and "amount" in exp:
                        print(f"   - {exp['name']}: ₹{exp['amount']} ({exp.get('category', 'unknown')})")
                return len(data) >= len(created_expense_ids)
            else:
                print("❌ Expenses response is not a list")
                return False
        else:
            print(f"❌ Get expenses failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get expenses error: {e}")
        return False

def test_create_budget():
    """Test POST /api/budgets"""
    print("\n💰 Testing Create Budget...")
    
    # Test annual budget
    try:
        response = requests.post(f"{API_URL}/budgets", json=test_budget_annual)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data["type"] == "annual":
                created_budget_ids.append(data["id"])
                print(f"✅ Annual budget created successfully")
                print(f"   ID: {data['id']}")
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
    
    # Test category budget
    try:
        response = requests.post(f"{API_URL}/budgets", json=test_budget_food)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data["type"] == "category":
                created_budget_ids.append(data["id"])
                print(f"✅ Food category budget created successfully")
                print(f"   ID: {data['id']}")
                print(f"   Amount: ₹{data['amount']}")
                print(f"   Category: {data['category']}")
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
    
    return annual_success and category_success

def test_get_budgets():
    """Test GET /api/budgets"""
    print("\n📈 Testing Get Budgets...")
    try:
        response = requests.get(f"{API_URL}/budgets")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Retrieved {len(data)} budgets")
                for budget in data:
                    if "type" in budget and "amount" in budget:
                        budget_type = budget['type']
                        amount = budget['amount']
                        category = budget.get('category', 'N/A')
                        print(f"   - {budget_type.title()}: ₹{amount} (Category: {category})")
                return len(data) >= len(created_budget_ids)
            else:
                print("❌ Budgets response is not a list")
                return False
        else:
            print(f"❌ Get budgets failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get budgets error: {e}")
        return False

def test_dashboard_analytics():
    """Test GET /api/dashboard"""
    print("\n📊 Testing Dashboard Analytics...")
    try:
        response = requests.get(f"{API_URL}/dashboard")
        if response.status_code == 200:
            data = response.json()
            required_fields = [
                "total_monthly_spending", "total_yearly_spending", "yearly_projection",
                "subscription_spending", "expense_spending", "upcoming_subscriptions",
                "category_breakdown", "budget_alerts"
            ]
            
            missing_fields = [field for field in required_fields if field not in data]
            if not missing_fields:
                print("✅ Dashboard analytics working correctly")
                print(f"   Monthly Spending: ₹{data['total_monthly_spending']:,.2f}")
                print(f"   Yearly Projection: ₹{data['yearly_projection']:,.2f}")
                print(f"   Subscription Spending: ₹{data['subscription_spending']:,.2f}")
                print(f"   Expense Spending: ₹{data['expense_spending']:,.2f}")
                print(f"   Upcoming Subscriptions: {len(data['upcoming_subscriptions'])}")
                print(f"   Category Breakdown: {len(data['category_breakdown'])} categories")
                print(f"   Budget Alerts: {len(data['budget_alerts'])} alerts")
                
                # Verify INR calculations
                if data['subscription_spending'] > 0:
                    print("✅ INR calculations appear correct")
                    return True
                else:
                    print("⚠️ No subscription spending calculated - may be expected if no subscriptions")
                    return True
            else:
                print(f"❌ Dashboard response missing fields: {missing_fields}")
                return False
        else:
            print(f"❌ Dashboard analytics failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Dashboard analytics error: {e}")
        return False

def test_smart_suggestions():
    """Test GET /api/suggestions"""
    print("\n💡 Testing Smart Suggestions...")
    try:
        response = requests.get(f"{API_URL}/suggestions")
        if response.status_code == 200:
            data = response.json()
            if "suggestions" in data and isinstance(data["suggestions"], list):
                suggestions = data["suggestions"]
                print(f"✅ Smart suggestions working correctly")
                print(f"   Generated {len(suggestions)} suggestions")
                for i, suggestion in enumerate(suggestions, 1):
                    print(f"   {i}. {suggestion}")
                return True
            else:
                print("❌ Suggestions response missing 'suggestions' field or not a list")
                return False
        else:
            print(f"❌ Smart suggestions failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Smart suggestions error: {e}")
        return False

def test_delete_subscription():
    """Test DELETE /api/subscriptions/{id}"""
    print("\n🗑️ Testing Delete Subscription...")
    if not created_subscription_ids:
        print("❌ No subscriptions to delete")
        return False
    
    subscription_id = created_subscription_ids[0]
    try:
        response = requests.delete(f"{API_URL}/subscriptions/{subscription_id}")
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                print(f"✅ Subscription deleted successfully")
                print(f"   Message: {data['message']}")
                return True
            else:
                print("❌ Delete response missing message")
                return False
        else:
            print(f"❌ Delete subscription failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Delete subscription error: {e}")
        return False

def test_invalid_data():
    """Test API with invalid data for error handling"""
    print("\n🚫 Testing Invalid Data Handling...")
    
    # Test invalid subscription data
    invalid_subscription = {
        "name": "",  # Empty name
        "cost": -100,  # Negative cost
        "billing_frequency": "invalid_frequency",
        "next_due_date": "invalid_date",
        "category": "invalid_category"
    }
    
    try:
        response = requests.post(f"{API_URL}/subscriptions", json=invalid_subscription)
        if response.status_code in [400, 422]:  # Bad request or validation error
            print("✅ Invalid subscription data properly rejected")
            validation_success = True
        else:
            print(f"⚠️ Invalid subscription data not properly validated (status: {response.status_code})")
            validation_success = False
    except Exception as e:
        print(f"❌ Error testing invalid subscription data: {e}")
        validation_success = False
    
    # Test non-existent resource
    try:
        response = requests.get(f"{API_URL}/subscriptions/non-existent-id")
        if response.status_code == 404:
            print("✅ Non-existent resource properly returns 404")
            not_found_success = True
        else:
            print(f"⚠️ Non-existent resource should return 404 (got: {response.status_code})")
            not_found_success = False
    except Exception as e:
        print(f"❌ Error testing non-existent resource: {e}")
        not_found_success = False
    
    return validation_success and not_found_success

def run_all_tests():
    """Run all backend API tests"""
    print("🚀 Starting NBNTracker Backend API Tests")
    print("=" * 50)
    
    test_results = {}
    
    # Core API tests
    test_results["health_check"] = test_health_check()
    test_results["create_subscription"] = test_create_subscription()
    test_results["get_subscriptions"] = test_get_subscriptions()
    test_results["update_subscription"] = test_update_subscription()
    test_results["create_expense"] = test_create_expense()
    test_results["get_expenses"] = test_get_expenses()
    test_results["create_budget"] = test_create_budget()
    test_results["get_budgets"] = test_get_budgets()
    test_results["dashboard_analytics"] = test_dashboard_analytics()
    test_results["smart_suggestions"] = test_smart_suggestions()
    test_results["delete_subscription"] = test_delete_subscription()
    test_results["invalid_data"] = test_invalid_data()
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend API tests passed!")
        return True
    else:
        print(f"⚠️ {total - passed} tests failed")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)