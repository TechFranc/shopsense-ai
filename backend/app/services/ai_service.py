import os
import json
from typing import Dict, List, Optional
from dotenv import load_dotenv
import google.generativeai as genai
from openai import OpenAI
from PIL import Image
import io

load_dotenv()

class AIService:
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "gemini").lower()
        self.gemini_model = None
        self.gemini_vision_model = None
        self.openai_client = None
        
        # Initialize Gemini with multiple fallback attempts
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            genai.configure(api_key=gemini_key)
            
            # Try different model names in order of preference
            models_to_try = [
                'models/gemini-2.5-flash',
                'models/gemini-flash-latest',
                'models/gemini-2.0-flash',
                'models/gemini-pro-latest',
            ]
            
            for model_name in models_to_try:
                try:
                    test_model = genai.GenerativeModel(model_name)
                    # Quick test to verify it works
                    test_response = test_model.generate_content("Hello")
                    
                    # If we get here, the model works!
                    self.gemini_model = genai.GenerativeModel(model_name)
                    self.gemini_vision_model = genai.GenerativeModel(model_name)
                    print(f"✅ Gemini AI initialized successfully (using {model_name})")
                    break
                except Exception as e:
                    print(f"⚠️ Model {model_name} failed: {str(e)[:50]}...")
                    continue
            
            if not self.gemini_model:
                print("❌ All Gemini models failed to initialize")
                
                # Initialize OpenAI only if key is provided
                openai_key = os.getenv("OPENAI_API_KEY")
                if openai_key:
                    try:
                        self.openai_client = OpenAI(api_key=openai_key)
                        print("✅ OpenAI initialized successfully")
                    except Exception as e:
                        print(f"❌ Failed to initialize OpenAI: {e}")
    
    async def extract_receipt_data(self, image_path: str) -> Dict:
        """Extract structured data from receipt image"""
        prompt = """
        Analyze this receipt image and extract the following information in JSON format:
        {
            "store_name": "store name",
            "purchase_date": "YYYY-MM-DD",
            "items": [
                {"name": "item name", "price": 0.00, "quantity": 1, "category": "category"}
            ],
            "total_amount": 0.00
        }
        
        For categories, use: groceries, electronics, clothing, dining, health, entertainment, home, transportation, other
        Be accurate with prices and item names. If unclear, make best estimate.
        """
        
        if self.provider == "gemini" and self.gemini_vision_model:
            return await self._extract_with_gemini(image_path, prompt)
        elif self.provider == "openai" and self.openai_client:
            return await self._extract_with_openai(image_path, prompt)
        else:
            print(f"❌ No AI provider available. Provider: {self.provider}")
            return self._get_fallback_data()
    
    async def _extract_with_gemini(self, image_path: str, prompt: str) -> Dict:
        """Extract using Gemini Vision API"""
        try:
            image = Image.open(image_path)
            response = self.gemini_vision_model.generate_content([prompt, image])
            
            # Parse JSON from response
            text = response.text.strip()
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0]
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0]
            
            return json.loads(text.strip())
        except Exception as e:
            print(f"Gemini extraction error: {e}")
            return self._get_fallback_data()
    
    async def _extract_with_openai(self, image_path: str, prompt: str) -> Dict:
        """Extract using OpenAI GPT-4 Vision API"""
        try:
            with open(image_path, "rb") as image_file:
                import base64
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )
            
            text = response.choices[0].message.content.strip()
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0]
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0]
            
            return json.loads(text.strip())
        except Exception as e:
            print(f"OpenAI extraction error: {e}")
            return self._get_fallback_data()
    
    async def analyze_spending_behavior(self, receipts_data: List[Dict]) -> Dict:
        """Analyze spending patterns and generate insights"""
        
        # Return empty if no data
        if not receipts_data:
            print("⚠️ No receipt data to analyze")
            return {"impulse_buys": [], "spending_trends": [], "peak_spending": {}, "top_categories": []}
        
        prompt = f"""
        Analyze this shopping behavior data and provide insights in JSON format:
        
        Data: {json.dumps(receipts_data[:20])}
        
        Return ONLY a valid JSON object with this exact structure:
        {{
            "impulse_buys": [
                {{"item": "name", "reason": "why it's impulse", "amount": 0.00}}
            ],
            "spending_trends": [
                {{"category": "category", "trend": "increasing/decreasing/stable", "insight": "explanation"}}
            ],
            "peak_spending": {{"day": "Monday", "time": "evening", "reason": "why"}},
            "top_categories": ["category1", "category2", "category3"]
        }}
        
        Do not include any explanatory text, only return the JSON object.
        """
        
        if self.provider == "gemini" and self.gemini_model:
            return await self._analyze_with_gemini(prompt)
        elif self.provider == "openai" and self.openai_client:
            return await self._analyze_with_openai(prompt)
        else:
            print(f"❌ No AI provider available for analysis")
            return {"impulse_buys": [], "spending_trends": [], "peak_spending": {}, "top_categories": []}
    
    async def _analyze_with_gemini(self, prompt: str) -> Dict:
        """Analyze using Gemini"""
        try:
            response = self.gemini_model.generate_content(prompt)
            text = response.text.strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0]
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0]
            
            result = json.loads(text.strip())
            print(f"✅ Gemini analysis successful")
            return result
        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return {"impulse_buys": [], "spending_trends": [], "peak_spending": {}, "top_categories": []}
    
    async def _analyze_with_openai(self, prompt: str) -> Dict:
        """Analyze using OpenAI"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            print(f"✅ OpenAI analysis successful")
            return result
        except Exception as e:
            print(f"OpenAI analysis error: {e}")
            return {"impulse_buys": [], "spending_trends": [], "peak_spending": {}, "top_categories": []}
    
    async def generate_recommendations(self, spending_data: Dict) -> List[Dict]:
        """Generate personalized shopping recommendations"""
        
        prompt = f"""
        Based on this spending data, generate 3-5 actionable recommendations to save money:
        
        Data: {json.dumps(spending_data)}
        
        Return ONLY a valid JSON array with this structure:
        [
            {{
                "type": "savings",
                "title": "short title",
                "description": "detailed recommendation",
                "potential_savings": 10.00,
                "category": "groceries"
            }}
        ]
        
        Do not include any explanatory text, only return the JSON array.
        """
        
        try:
            if self.provider == "gemini" and self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                text = response.text.strip()
            elif self.provider == "openai" and self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "user", "content": prompt}]
                )
                text = response.choices[0].message.content.strip()
            else:
                print("❌ No AI provider available for recommendations")
                return []
            
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0]
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0]
            
            result = json.loads(text.strip())
            print(f"✅ Recommendations generated successfully")
            return result
        except Exception as e:
            print(f"Recommendations error: {e}")
            return []
    
    def _get_fallback_data(self) -> Dict:
        """Fallback data structure if AI extraction fails"""
        return {
            "store_name": "Unknown Store",
            "purchase_date": None,
            "items": [],
            "total_amount": 0.00
        }

# Singleton instance
ai_service = AIService()