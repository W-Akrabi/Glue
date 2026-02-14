#!/usr/bin/env python3

import requests
import json
import sys
from typing import Dict, Any

class TaskManagementAPITester:
    def __init__(self, base_url: str = "https://319e3e33-095f-4295-ac41-06594f88325e.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name: str, success: bool, message: str = ""):
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            self.failed_tests.append({"test": name, "error": message})
            print(f"❌ {name}: FAILED - {message}")

    def test_health_endpoint(self) -> bool:
        """Test the health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    self.log_test("Health Check", True)
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Health Check", False, f"Request error: {str(e)}")
            return False

    def test_ai_task_suggestions(self) -> bool:
        """Test AI task suggestions endpoint"""
        # Using real user IDs from the context
        test_payload = {
            "userId": "cmlllcxj70006tf6l5dunkufz",
            "organizationId": "cmlllcxgi0000tf6l28970nrz"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/ai/task-suggestions",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30  # AI requests can take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    suggestion_data = data["data"]
                    # Check if response has expected structure
                    has_valid_structure = (
                        isinstance(suggestion_data.get("prioritized_actions", []), list) and
                        isinstance(suggestion_data.get("blocker_alerts", []), list) and
                        isinstance(suggestion_data.get("quick_wins", []), list) and
                        "summary" in suggestion_data
                    )
                    if has_valid_structure:
                        self.log_test("AI Task Suggestions", True)
                        print(f"   Summary: {suggestion_data.get('summary', 'No summary')}")
                        return True
                    else:
                        self.log_test("AI Task Suggestions", False, "Invalid response structure")
                        return False
                else:
                    self.log_test("AI Task Suggestions", False, "No 'data' field in response")
                    return False
            elif response.status_code == 404:
                self.log_test("AI Task Suggestions", False, "User not found (expected with test data)")
                return False
            elif response.status_code == 500:
                self.log_test("AI Task Suggestions", False, f"Server error: {response.text}")
                return False
            else:
                self.log_test("AI Task Suggestions", False, f"Status code: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("AI Task Suggestions", False, f"Request error: {str(e)}")
            return False

    def test_ai_assignment_recommendations(self) -> bool:
        """Test AI assignment recommendations endpoint"""
        test_payload = {
            "organizationId": "test-org-id"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/ai/assignment-recommendations",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30  # AI requests can take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    assignment_data = data["data"]
                    # Check if response has expected structure
                    has_valid_structure = (
                        isinstance(assignment_data.get("assignments", []), list) and
                        isinstance(assignment_data.get("workload_analysis", []), list) and
                        isinstance(assignment_data.get("alerts", []), list) and
                        "summary" in assignment_data
                    )
                    if has_valid_structure:
                        self.log_test("AI Assignment Recommendations", True)
                        print(f"   Summary: {assignment_data.get('summary', 'No summary')}")
                        return True
                    else:
                        self.log_test("AI Assignment Recommendations", False, "Invalid response structure")
                        return False
                else:
                    self.log_test("AI Assignment Recommendations", False, "No 'data' field in response")
                    return False
            elif response.status_code == 500:
                self.log_test("AI Assignment Recommendations", False, f"Server error: {response.text}")
                return False
            else:
                self.log_test("AI Assignment Recommendations", False, f"Status code: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("AI Assignment Recommendations", False, f"Request error: {str(e)}")
            return False

    def test_ai_endpoints_with_optional_task_id(self) -> bool:
        """Test AI assignment recommendations with optional taskId"""
        test_payload = {
            "organizationId": "test-org-id",
            "taskId": "test-task-id"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/ai/assignment-recommendations",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    self.log_test("AI Assignment Recommendations (with taskId)", True)
                    return True
                else:
                    self.log_test("AI Assignment Recommendations (with taskId)", False, "No 'data' field in response")
                    return False
            else:
                self.log_test("AI Assignment Recommendations (with taskId)", False, f"Status code: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("AI Assignment Recommendations (with taskId)", False, f"Request error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🧪 Starting backend API tests for {self.base_url}")
        print("=" * 60)
        
        # Test health check first
        health_ok = self.test_health_endpoint()
        
        if not health_ok:
            print("\n❌ Health check failed. Backend may not be running.")
            return False
            
        # Test AI endpoints
        self.test_ai_task_suggestions()
        self.test_ai_assignment_recommendations()
        self.test_ai_endpoints_with_optional_task_id()
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed_test in self.failed_tests:
                print(f"   • {failed_test['test']}: {failed_test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = TaskManagementAPITester()
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())