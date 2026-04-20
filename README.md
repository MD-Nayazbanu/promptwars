# StudyGenius – AI Study Planner Assistant

## 1. Overview
StudyGenius is a lightweight, AI-inspired study planning assistant that helps students convert limited time, multiple subjects, and weak areas into a practical and structured study plan.

The system analyzes user inputs such as exam date, subjects, weak topics, and available study hours to generate a prioritized and adaptive schedule.

---

## 2. Chosen Vertical
Education / Student Productivity

---

## 3. Problem Statement
Students often struggle to:
- Decide what to study first
- Manage limited time effectively
- Balance multiple subjects
- Include revision strategically before exams

Traditional planners do not adapt to urgency or individual weaknesses, leading to inefficient preparation.

---

## 4. Solution
StudyGenius provides a dynamic assistant that:
- Prioritizes subjects based on urgency and weakness
- Allocates study time efficiently
- Generates a day-by-day study schedule
- Includes revision sessions automatically
- Provides intelligent insights and recommendations

---

## 5. Key Features
- Personalized study plan generation
- Priority-based subject ranking
- Smart insights based on user inputs
- Adaptive behavior for different scenarios
- Edge-case handling (low time, high workload)
- Interactive dashboard with clear outputs
- Plan optimization feature
- Copy/export functionality

---

## 6. Smart Assistant Logic
The system uses a simple scoring mechanism to prioritize subjects:

Priority Score = (Urgency × 2) + Weakness + Time Constraint

Where:
- Urgency depends on proximity to exam date
- Weakness is based on user input
- Time Constraint reflects available study hours

Behavioral adaptations:
- High urgency triggers revision-focused planning
- Limited time results in compressed schedules
- Weak subjects receive more time allocation

---

## 7. How It Works
1. User enters:
   - Exam date
   - Subjects
   - Weak topics
   - Available study hours
   - Preferred study time

2. The system:
   - Calculates priority scores
   - Determines optimal distribution of study time
   - Generates a structured schedule
   - Produces insights and recommendations

3. Output:
   - Timeline-based study plan
   - Priority breakdown
   - Assistant strategy explanation
   - Smart insights

---

## 8. Google Services Usage
- Developed using Google Antigravity for AI-assisted development
- Designed for potential integration with:
  - Google Calendar (study reminders)
  - Google Gemini (adaptive recommendations)
  - Google Sheets (progress tracking)

---

## 9. Assumptions
- Users provide accurate exam dates and inputs
- Study hours remain consistent daily
- Weak topics require additional attention
- Subjects are independent in preparation

---

---

## 10. How to Run
Option 1:
- Open `index.html` in a web browser

Option 2:
- Use the deployed GitHub Pages link

---

## 11. Future Improvements
- Direct Google Calendar integration
- AI-powered plan refinement using Gemini
- Progress tracking dashboard
- User authentication and saved plans
- Mobile application version

---

## 12. Conclusion
StudyGenius demonstrates how a simple, well-structured assistant can provide meaningful value by combining user context, logical decision-making, and clean design to solve a real-world problem in student productivity.