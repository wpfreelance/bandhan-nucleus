import json

def get_fallback_services():
    """
    Returns a predefined list of pathology services as fallback
    when web scraping isn't available or fails
    """
    services = [
        {
            "id": "1",
            "name": "Complete Blood Count (CBC)",
            "price": "500",
            "description": "A complete blood count (CBC) is a blood test used to evaluate your overall health and detect a wide range of disorders, including anemia, infection and leukemia.",
            "category": "Blood Tests",
            "image": "https://images.unsplash.com/photo-1503676382389-4809596d5290",
            "features": ["Results in 24 hours", "No fasting required", "Home collection available"],
            "slug": "complete-blood-count"
        },
        {
            "id": "2",
            "name": "Lipid Profile",
            "price": "800",
            "description": "A lipid profile is a blood test that measures lipids—fats and fatty substances used as a source of energy by your body. This test is used to assess your risk of developing cardiovascular disease.",
            "category": "Blood Tests",
            "image": "https://images.unsplash.com/photo-1530099486328-e021101a494a",
            "features": ["Fasting required", "Results in 24 hours", "Comprehensive report"],
            "slug": "lipid-profile"
        },
        {
            "id": "3",
            "name": "Liver Function Test",
            "price": "700",
            "description": "Liver function tests are blood tests that measure different enzymes, proteins, and substances made by the liver. These tests check the overall health of your liver.",
            "category": "Blood Tests",
            "image": "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1",
            "features": ["No fasting required", "Results in 24 hours", "Detailed analysis"],
            "slug": "liver-function-test"
        },
        {
            "id": "4",
            "name": "Thyroid Profile",
            "price": "900",
            "description": "A thyroid profile is a group of tests that may be ordered together to help evaluate thyroid gland function and to help diagnose thyroid disorders.",
            "category": "Hormone Tests",
            "image": "https://images.unsplash.com/photo-1454789476662-53eb23ba5907",
            "features": ["No fasting required", "Results in 48 hours", "Expert evaluation"],
            "slug": "thyroid-profile"
        },
        {
            "id": "5",
            "name": "Vitamin D Test",
            "price": "1200",
            "description": "A vitamin D test measures the amount of vitamin D in your blood. The test can determine if your vitamin D levels are too high or too low.",
            "category": "Vitamin Tests",
            "image": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
            "features": ["No special preparation", "Results in 48 hours", "Comprehensive analysis"],
            "slug": "vitamin-d-test"
        },
        {
            "id": "6",
            "name": "HbA1c (Glycated Hemoglobin)",
            "price": "600",
            "description": "The HbA1c test measures the amount of hemoglobin with attached glucose and provides information about your average blood sugar levels over the past 3 months.",
            "category": "Diabetes",
            "image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d",
            "features": ["No fasting required", "Results in 24 hours", "Diabetes monitoring"],
            "slug": "hba1c"
        },
        {
            "id": "7",
            "name": "Complete Health Package - Basic",
            "price": "2500",
            "description": "A comprehensive health check-up package that includes essential tests to assess your overall health status. Ideal for routine annual check-ups.",
            "category": "Health Packages",
            "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
            "features": ["65+ tests", "Doctor consultation", "Home collection available", "Digital reports"],
            "slug": "basic-health-package"
        },
        {
            "id": "8",
            "name": "Complete Health Package - Advanced",
            "price": "4500",
            "description": "An advanced health check-up package that includes comprehensive tests to thoroughly evaluate your health status. Recommended for individuals above 40 years.",
            "category": "Health Packages",
            "image": "https://images.unsplash.com/photo-1519452575417-564c1401ecc0",
            "features": ["85+ tests", "Doctor consultation", "Home collection available", "Digital reports", "Follow-up included"],
            "slug": "advanced-health-package"
        },
        {
            "id": "9",
            "name": "COVID-19 RT-PCR Test",
            "price": "1800",
            "description": "RT-PCR test for detection of SARS-CoV-2, the virus that causes COVID-19. Highly accurate and widely accepted for travel and other purposes.",
            "category": "COVID Tests",
            "image": "https://images.unsplash.com/photo-1583947215259-38e31be8751f",
            "features": ["Results in 24 hours", "Home collection available", "Digital reports", "Travel certificate"],
            "slug": "covid19-rtpcr"
        },
        {
            "id": "10",
            "name": "Kidney Function Test",
            "price": "700",
            "description": "A kidney function test is a group of tests that may be performed together to evaluate kidney (renal) function, to help diagnose kidney disorders.",
            "category": "Blood Tests",
            "image": "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06",
            "features": ["No special preparation", "Results in 24 hours", "Comprehensive analysis"],
            "slug": "kidney-function-test"
        },
        {
            "id": "11",
            "name": "Hemogram Test",
            "price": "400",
            "description": "A hemogram is a test that measures the levels of red cells, white cells, and platelets in the blood, and provides valuable information about the blood composition.",
            "category": "Blood Tests",
            "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
            "features": ["No fasting required", "Results in 24 hours", "Basic health assessment"],
            "slug": "hemogram-test"
        },
        {
            "id": "12",
            "name": "Student Health Package",
            "price": "1800",
            "description": "A specially designed health package for students. Includes essential tests to ensure optimal health and academic performance.",
            "category": "Health Packages",
            "image": "https://images.unsplash.com/photo-1499557354967-2b2d8910bcca",
            "features": ["45+ tests", "Doctor consultation", "Digital reports", "Nutrition advice"],
            "slug": "student-health-package"
        }
    ]
    
    return {"services": services}

if __name__ == "__main__":
    print(json.dumps(get_fallback_services(), indent=2))